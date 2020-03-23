import { createGlobalStyle } from 'styled-components';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  html {
  font-size: 62.5%;
 }

  *:focus {
    outline: 0;
  }




  body {
   -webkit-font-smoothing: antialiased;
   font-size: 1.6rem;
    font-family: 'Titillium Web', sans-serif;
    color: #333;
    background-color: rgb(113, 89, 193);
  }

  body, input, button {
    font: 14px 'Roboto', sans-serif;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  button {
    cursor: pointer;
  }

  ::selection {
  background: #7159c1;
  color: #fff;
 }


`;
