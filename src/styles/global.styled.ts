'use client';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    font-weight: 200;
  }

// root colors
  :root {
    --timberwolf: #CED0CE;
    --eerieBlack: #191919;
    --platinum: #E6E8E6;
    --coquelicot: #F15025;
    --green: #8BF125;
    --myGreen: #a4de02;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'montserrat', sans-serif;
    background: --platinum;
    
    color: --eerieBlack;
  }

  
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
`;
