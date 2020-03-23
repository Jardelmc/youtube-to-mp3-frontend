import React, { useState, useEffect, useCallback } from 'react';

import { Container, Form, Card, Button, Row, Spinner } from 'react-bootstrap';
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

export default function Index() {
  const [initialized, setInitialized] = useState(false);
  const [url, setUrl] = useState(false);
  const [videoInfo, setVideoInfo] = useState(false);

  const [linkLoading, setLinkLoading] = useState(false);
  const [downloadLoading, setDownloadLinkLoading] = useState(false);
  const [arrayGifs, setArrayGifs] = useState(false);

  const [selectedVideos, setSelectedVideos] = useState(false);

  const getVideoInfo = useCallback(async (youtubeUrl) => {
    setLinkLoading(true);
    try {
      if (youtubeUrl) {
        const response = await api.post('getInfo', { youtubeUrl });

        const { status, data } = response;

        if (status === 200) {
          if (!data.err) {
            const { title, thumbnailUrl, videoId, relatedVideoInfo } = data;
            setVideoInfo({ title, thumbnailUrl, videoId, relatedVideoInfo });
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

  const handleDownloadOne = useCallback(async (urlToDownload, filename) => {
    if (url) {
      window.scrollTo(0, 0);
      setDownloadLinkLoading(true);
      try {
        api
          .post(
            'download',
            { youtubeUrl: urlToDownload },
            { responseType: 'blob' }
          )
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
        api
          .post(
            'downloadMany',
            { relatedVideoInfo: selectedVideos },
            { responseType: 'blob' }
          )
          .then((response) => {
            const file = new Blob([response.data], {
              type: 'application/zip',
            });
            const a = document.createElement('a');
            document.body.appendChild(a);
            const blobUrl = window.URL.createObjectURL(file);
            a.href = blobUrl;
            a.download = `${videoInfo.title} e outras ${
              relatedVideoInfo.length - 1
            }.zip`;
            a.click();

            setDownloadLinkLoading(false);
          })
          .catch((error) => {
            setDownloadLinkLoading(false);
            toast.error('Erro ao baixar música');
          });
      } catch (error) {
        setDownloadLinkLoading(false);
      }
    }
  });

  const handleChangeSelect = (value) => {
    let alreadyAdded = true;

    selectedVideos.forEach((videoData) => {
      if (videoData.relatedId === value.relatedId) {
        alreadyAdded = false;
      }
    });

    if (alreadyAdded) {
      const tempArray = selectedVideos.map((x) => x);
      tempArray.push(value);

      setSelectedVideos(tempArray);
    } else {
      const tempArray = selectedVideos.filter(
        (x) => x.relatedId !== value.relatedId
      );
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
              right: '7vh',
              height: '6vh',
              fontSize: '2vh',
              zIndex: 600,
              opacity: downloadLoading ? '40%' : '100%',
              pointerEvents: downloadLoading ? 'none' : 'all',
            }}
            disabled={downloadLoading}
            variant="success"
            onClick={() => handleDownloadMany()}
          >
            <strong>Baixar {selectedVideos.length} como ZIP</strong>
          </Button>
        )}

      {arrayGifs && downloadLoading && (
        <>
          <div>
            <img
              src={arrayGifs[parseInt(Math.random() * (7 - 0) + 0)]}
              alt="Aguardando"
              style={{
                position: 'absolute',
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
                  position: 'absolute',
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
          <Form.Label style={{ color: '#eee', fontSize: '3vh' }}>
            <strong>&emsp;Link do vídeo: </strong>
          </Form.Label>
          <Container className="d-flex ">
            <Form.Control
              size="lg"
              type="text"
              placeholder="https://www.youtube.com/watch?v=mvyhprS1c-Y"
              style={{ height: '7vh', minHeight: '52px', marginTop: '2vh' }}
              onChange={(e) => handleChangeUrlInput(e.target.value)}
            />

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

          {videoInfo && videoInfo.title ? (
            <>
              <Container>
                <Card style={{ width: '75%', margin: 'auto' }} className="p-2">
                  <Card.Img variant="top" src={videoInfo.thumbnailUrl} />
                  <Card.Body>
                    <Card.Title>{videoInfo.title}</Card.Title>

                    <Button
                      variant="success"
                      onClick={() => handleDownloadOne(url, videoInfo.title)}
                    >
                      <strong>Download MP3</strong>
                    </Button>
                  </Card.Body>
                </Card>
              </Container>

              <br />
              <br />

              <h3 className="h2" style={{ color: '#eee' }}>
                Vídeos relacionados:
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
                          <Card.Body>
                            <Card.Title>{element.relatedTitle}</Card.Title>
                            <Row
                              style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                              }}
                            >
                              <Button
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

                              <Form.Check
                                type="switch"
                                id={element.relatedId}
                                label=" "
                                style={{}}
                                onChange={() =>
                                  handleChangeSelect({
                                    relatedId: element.relatedId,
                                    relatedTitle: element.relatedTitle,
                                  })
                                }
                              />
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
            <Card
              text={'white'}
              style={{ width: '95%', background: '#28a745', margin: 'auto' }}
            >
              <Card.Header>
                <strong>Youtube para MP3</strong>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                  Site desenvolvido para realizar o download do áudio de vídeos
                  que estão no Youtube. <br />
                  <br />
                  Basta colar o link do vídeo desejado acima e fazer o download.{' '}
                  <br />
                  <br />
                  É possível também baixar de forma prática áudios de vídeos
                  relacionados, todos ficam exibidos no mesmo lugar, vc escolhe
                  e baixa na hora. Simples assim.
                  <br />
                  <br />
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: '#eee',
            position: 'absolute',
            bottom: '0',
            width: '100%',
            maxWidth: '712px',
          }}
        >
          <a
            href="https://github.com/Jardelmc"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <img src={github} alt="github" style={{ maxWidth: '2.5vh' }} />
            &emsp;Jardel Casteluber
          </a>
        </div>
      </div>
    </>
  );
}
