import React, { useState, useEffect, useCallback } from 'react';

import { Container, Form, Card, Button, Row, Spinner } from 'react-bootstrap';
import { Line } from 'rc-progress';
import api from '../../services/api';
import { toast } from 'react-toastify';

import gif1 from '../../assets/1.webp';
import gif2 from '../../assets/2.webp';
import gif3 from '../../assets/3.webp';
import gif4 from '../../assets/4.webp';
import gif5 from '../../assets/5.webp';
import gif6 from '../../assets/6.webp';
import gif7 from '../../assets/7.webp';

import github from '../../assets/git.svg';
import zip from '../../assets/zip.svg';
import youtube from '../../assets/youtube.png';

export default function Index() {
  const [initialized, setInitialized] = useState(false);
  const [url, setUrl] = useState(false);
  const [videoInfo, setVideoInfo] = useState(false);

  const [linkLoading, setLinkLoading] = useState(false);
  const [downloadLoading, setDownloadLinkLoading] = useState(false);
  const [arrayGifs, setArrayGifs] = useState(false);

  const [selectedVideos, setSelectedVideos] = useState(false);
  const [selectedArrayIdsVideos, setSelectedArrayIdsVideos] = useState({});
  const [percentProgress, setPercentProgress] = useState(false);

  const getVideoInfo = useCallback(async (youtubeUrl) => {
    setLinkLoading(true);
    try {
      if (youtubeUrl) {
        const response = await api.post('getInfo', { youtubeUrl });

        const { status, data } = response;

        if (status === 200) {
          if (!data.err) {
            const {
              title,
              thumbnailUrl,
              videoId,
              duration,
              relatedVideoInfo,
            } = data;
            setVideoInfo({
              title,
              thumbnailUrl,
              videoId,
              duration,
              relatedVideoInfo,
            });
            const newSelectedVideo = [];

            // Para preencher array de videos selecionados com o inserido como valor
            const payload = { relatedId: videoId, relatedTitle: title };
            newSelectedVideo.push(payload);
            setSelectedVideos(newSelectedVideo);
            // Fim preencher array

            setLinkLoading(false);
          } else {
            setLinkLoading(false);
            toast.error(data.err);
            return;
          }
        }
      }

      window.scroll({ top: 150, left: 0, behavior: 'smooth' });

      setLinkLoading(false);
    } catch (error) {
      setLinkLoading(false);
      toast.error('Erro ao obter informações do link.');
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      //getVideoInfo('https://www.youtube.com/watch?v=mvyhprS1c-Y');
      setArrayGifs([gif1, gif2, gif3, gif4, gif5, gif6, gif7]);
      setInitialized(true);
    }
  }, [initialized]);

  const handleChangeUrlInput = (value) => {
    if (value && value.includes('youtu')) {
      if (url !== value) {
        setUrl(value);
        getVideoInfo(value);
      }
    }
  };

  const handleClearData = () => {
    document.getElementById('linkField').value = '';
    setUrl(false);
    setVideoInfo(false);
    setPercentProgress(false);
    setSelectedVideos(false);
    setSelectedArrayIdsVideos({});
  };

  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const handleDownloadOne = useCallback(async (urlToDownload, filename) => {
    if (url) {
      window.scrollTo(0, 0);
      setDownloadLinkLoading(true);
      try {
        const response = await api.post('download', {
          youtubeUrl: urlToDownload,
        });

        const { data } = response;

        if (!data.hash) {
          setDownloadLinkLoading(false);
          toast.error('Erro ao baixar música');
          return;
        }

        let control = false;

        while (!control) {
          const responseCheckStatus = await api.post('checkStatus', {
            hash: data.hash,
          });

          if (responseCheckStatus.data.err) {
            setDownloadLinkLoading(false);
            toast.error(
              'Erro ao baixar música. Falha ao processar vídeo no servidor'
            );
            return;
          }

          if (responseCheckStatus.data.isReady) {
            control = true;
            api
              .post('getFile', { hash: data.hash }, { responseType: 'blob' })
              .then((response) => {
                const file = new Blob([response.data], {
                  type:
                    'audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;text/xml',
                });
                const a = document.createElement('a');
                document.body.appendChild(a);
                const blobUrl = window.URL.createObjectURL(file);
                a.href = blobUrl;
                a.download = `${filename}.mp3`;
                a.click();

                setDownloadLinkLoading(false);
              })
              .catch((error) => {
                setDownloadLinkLoading(false);
                toast.error('Erro ao baixar música');
              });
          } else {
            await sleep(3000);
          }
        }
      } catch (error) {
        setDownloadLinkLoading(false);
      }
    }
  });

  const handleDownloadMany = useCallback(async () => {
    if (url && videoInfo && videoInfo.relatedVideoInfo) {
      window.scrollTo(0, 0);
      const { relatedVideoInfo } = videoInfo;

      relatedVideoInfo.push({
        relatedId: videoInfo.videoId,
        relatedTitle: videoInfo.title,
      });

      setDownloadLinkLoading(true);
      try {
        const response = await api.post('downloadMany', {
          relatedVideoInfo: selectedVideos,
        });

        const { data } = response;

        if (!data.hash) {
          setDownloadLinkLoading(false);
          toast.error('Erro ao baixar música');
          return;
        }

        let control = false;

        const maxVideoForDownloadLength = selectedVideos.length;

        while (!control) {
          const responseCheckStatus = await api.post('checkStatus', {
            hash: data.hash,
          });

          if (responseCheckStatus.data.err) {
            setDownloadLinkLoading(false);

            toast.error(
              'Erro ao baixar música. Falha ao processar vídeo no servidor'
            );
            return;
          }

          if (responseCheckStatus.data.tempDownloaded) {
            const percentTemp =
              (responseCheckStatus.data.tempDownloaded * 100) /
              maxVideoForDownloadLength;
            setPercentProgress(percentTemp);
          }

          if (responseCheckStatus.data.isReady) {
            control = true;

            api
              .post('getFile', { hash: data.hash }, { responseType: 'blob' })
              .then((response) => {
                const file = new Blob([response.data], {
                  type: 'application/zip',
                });
                const a = document.createElement('a');
                document.body.appendChild(a);
                const blobUrl = window.URL.createObjectURL(file);
                a.href = blobUrl;
                a.download = `${videoInfo.title} e outras ${
                  selectedVideos.length - 1
                } músicas relacionadas.zip`;
                a.click();

                setSelectedArrayIdsVideos({});

                setDownloadLinkLoading(false);
              })
              .catch((error) => {
                setDownloadLinkLoading(false);
                toast.error('Erro ao baixar música');
              });
          } else {
            await sleep(3000);
          }
        }
      } catch (error) {
        setDownloadLinkLoading(false);
      }
    }
  });

  const handleChangeSelect = (value) => {
    let alreadyAdded = false;

    selectedVideos.forEach((videoData) => {
      if (videoData.relatedId === value.relatedId) {
        alreadyAdded = true;
      }
    });

    if (!alreadyAdded) {
      const tempArray = selectedVideos.map((x) => x);
      tempArray.push(value);

      const tempVar = selectedArrayIdsVideos;
      const tempVidId = value.relatedId;

      tempVar[tempVidId] = tempVidId;

      setSelectedArrayIdsVideos(tempVar);

      setSelectedVideos(tempArray);
    } else {
      const tempArray = selectedVideos.filter(
        (x) => x.relatedId !== value.relatedId
      );
      const tempVar = selectedArrayIdsVideos;
      const tempVidId = value.relatedId;

      tempVar[tempVidId] = false;

      setSelectedArrayIdsVideos(tempVar);

      setSelectedVideos(tempArray);
    }
  };

  return (
    <>
      <br />
      <br />
      <br />

      {videoInfo &&
        videoInfo.relatedVideoInfo &&
        videoInfo.relatedVideoInfo.length > 0 && (
          <Button
            style={{
              position: 'fixed',
              top: '6vh',
              right: '9vw',
              height: '12vw',
              width: '20vw',
              maxWidth: '96px',
              maxHeight: '48px',
              fontSize: '1.6rem',
              zIndex: 600,
              opacity: downloadLoading ? '40%' : '100%',
              pointerEvents: downloadLoading ? 'none' : 'all',
              display: selectedVideos.length > 1 ? 'block' : 'none',
            }}
            disabled={downloadLoading}
            variant="success"
            onClick={() => handleDownloadMany()}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={zip} alt="Download" style={{ width: '3rem' }} />

              <strong>&emsp;{selectedVideos.length}</strong>
            </div>
          </Button>
        )}

      {arrayGifs && downloadLoading && (
        <>
          <div>
            <img
              src={arrayGifs[parseInt(Math.random() * (7 - 0) + 0)]}
              alt="Aguardando"
              style={{
                position: 'fixed',
                zIndex: 500,
                maxWidth: '20vh',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 'auto',
                marginBottom: 'auto',
                left: '0',
                right: '0',
                top: '0',
                bottom: '0',
                borderRadius: '10%',
              }}
            />

            {downloadLoading && (
              <Spinner
                animation="border"
                role="status"
                variant="light"
                style={{
                  position: 'fixed',
                  zIndex: 501,
                  maxWidth: '20vh',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: '0',
                  right: '0',
                  bottom: '25vh',
                }}
                className="d-flex "
              >
                <span className="sr-only">Loading...</span>
              </Spinner>
            )}

            <div style={{ width: '95%' }}>
              <Line
                percent={percentProgress || 0}
                strokeWidth="1"
                strokeColor="#28a745"
                style={{
                  position: 'fixed',
                  zIndex: 501,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: '0',
                  right: '0',
                  bottom: '16vh',
                  maxWidth: '400px',
                  width: '85%',
                }}
              />
            </div>
          </div>
        </>
      )}

      <div
        style={{
          maxWidth: '712px',
          margin: 'auto',
          opacity: downloadLoading ? '40%' : '100%',
          pointerEvents: downloadLoading ? 'none' : 'all',
        }}
      >
        <Container>
          <Form.Label style={{ color: '#eee', fontSize: '2rem' }}>
            <strong>&nbsp;&nbsp;&nbsp;Link do vídeo: </strong>
          </Form.Label>
          <Container className="d-flex ">
            <Form.Control
              size="lg"
              type="text"
              placeholder="Ex: https://www.youtube.com/watch?v=L5M8_gwioh0"
              style={{ height: '7vh', minHeight: '52px', marginTop: '2vh' }}
              onChange={(e) => handleChangeUrlInput(e.target.value)}
              id="linkField"
            />

            {url && !linkLoading && (
              <button
                type="button"
                class="close"
                aria-label="Close"
                style={{ background: 'none', border: 'none' }}
                onClick={() => {
                  handleClearData();
                }}
              >
                &nbsp; &nbsp; &nbsp; &nbsp;
                <span
                  aria-hidden="true"
                  class="text-white"
                  style={{ fontSize: '3rem' }}
                >
                  &times;
                </span>
              </button>
            )}

            {linkLoading && (
              <Spinner
                animation="border"
                role="status"
                variant="light"
                style={{ marginTop: '4vh', marginLeft: '1vh' }}
                className="d-flex "
              >
                <span className="sr-only">Loading...</span>
              </Spinner>
            )}
          </Container>
          <br />
          <br />

          {videoInfo && videoInfo.title && url ? (
            <>
              <Container>
                <Card style={{ width: '75%', margin: 'auto' }} className="p-2">
                  <Card.Img variant="top" src={videoInfo.thumbnailUrl} />
                  <Card.Body>
                    <Card.Title>
                      {videoInfo.title}
                      <br />
                      <br />
                      <br />
                    </Card.Title>

                    <div
                      style={{
                        // color: '#9b9b9b',
                        background: '#fff',
                        borderRadius: '20px',
                        position: 'absolute',
                        top: '2vh',
                        right: '2.5vh',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1rem',
                          padding: '0.5vw',
                        }}
                      >
                        {videoInfo.duration}
                      </span>
                    </div>

                    <Button
                      variant="success"
                      onClick={() => handleDownloadOne(url, videoInfo.title)}
                    >
                      <strong>Download MP3</strong>
                    </Button>

                    <Form.Check
                      style={{
                        position: 'absolute',
                        bottom: '2vh',
                        right: '1vh',
                      }}
                      type="switch"
                      id="mainSwitch"
                      checked
                      label=" "
                    />
                  </Card.Body>
                </Card>
              </Container>

              <br />
              <br />

              <h3 className="h2" style={{ color: '#eee' }}>
                <strong>Vídeos relacionados:</strong>
              </h3>
              <Container
                className="d-flex flex-wrap justify-content-around"
                style={{ margin: 'auto', width: '110%' }}
              >
                <Row style={{}}>
                  {videoInfo.relatedVideoInfo &&
                    videoInfo.relatedVideoInfo.map((element) => (
                      <>
                        <Card style={{ width: '45%' }} className="p-2">
                          <Card.Img
                            variant="top"
                            src={element.relatedThumbnail}
                          />

                          <div
                            style={{
                              // color: '#9b9b9b',
                              background: '#fff',
                              borderRadius: '20px',
                              position: 'absolute',
                              top: '2vh',
                              right: '2.5vh',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '1rem',
                                padding: '0.5vw',
                              }}
                            >
                              {element.relatedDuration}
                            </span>
                          </div>

                          <Card.Body>
                            <Card.Title>{element.relatedTitle}</Card.Title>
                            <Row
                              style={{
                                width: '100%',
                                minHeight: '6vh',
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                              }}
                            >
                              <Button
                                style={{
                                  position: 'absolute',
                                  bottom: '1vh',
                                  left: '2vh',
                                }}
                                variant="success"
                                onClick={() =>
                                  handleDownloadOne(
                                    `https://www.youtube.com/watch?v=${element.relatedId}`,
                                    element.relatedTitle
                                  )
                                }
                              >
                                <strong>Download MP3</strong>
                              </Button>

                              {selectedArrayIdsVideos && (
                                <Form.Check
                                  style={{
                                    position: 'absolute',
                                    bottom: '1vh',
                                    right: '1vh',
                                  }}
                                  type="switch"
                                  id={element.relatedId}
                                  checked={
                                    selectedArrayIdsVideos[element.relatedId] ||
                                    false
                                  }
                                  label=" "
                                  onChange={() =>
                                    handleChangeSelect({
                                      relatedId: element.relatedId,
                                      relatedTitle: element.relatedTitle,
                                    })
                                  }
                                />
                              )}
                            </Row>
                          </Card.Body>
                        </Card>
                        &nbsp; &nbsp;
                      </>
                    ))}
                </Row>
              </Container>
            </>
          ) : (
            <div style={{}}>
              <br />
              <br />
              <br />
              <Card
                text={'white'}
                style={{
                  width: '75%',
                  maxWidth: '480px',
                  background: '#28a745',
                  margin: 'auto',
                }}
              >
                <Card.Header>
                  <div style={{ position: 'relative' }}>
                    <strong>Youtube para MP3</strong>
                    <img
                      src={youtube}
                      alt="youtubeFoto"
                      style={{
                        width: '2.5rem',
                        marginLeft: '40%',
                        position: 'absolute',
                        right: '0',
                        top: '-0.3rem',
                      }}
                    />
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Text style={{ textAlign: 'justify' }}>
                    Baixe o áudio de vídeos do Youtube em formato MP3 e ouça
                    offline quando quiser. <br />
                    <br />
                    Basta colar o link do vídeo desejado acima e fazer o
                    download. <br />
                    <br />
                    É possível também baixar de forma prática áudios de vídeos
                    relacionados, todos ficam exibidos no mesmo lugar, basta
                    selecionar quantos quiser e baixar.
                    <br />
                    <br />
                    Simples assim.
                    <br />
                    Gratuito e sem propagandas.
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          )}
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: '#eee',
            marginTop: '30vh',
            width: '100%',
            maxWidth: '712px',
          }}
        >
          <a
            href="https://github.com/Jardelmc"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <img src={github} alt="github" style={{ maxWidth: '2.5vh' }} />
            &emsp;Github
          </a>
        </div>
      </div>
    </>
  );
}
