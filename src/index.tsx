import React, { Component, useEffect } from 'react';
import { render } from 'react-dom';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import App from './App';
import './sandbox-styles.css';

render(
  <ParentSize>{({ width, height }) => <App width={width} height={height} />}</ParentSize>,
  document.getElementById('root'),
);

  