import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Group } from '@visx/group';
import genBins, { Bin, Bins } from '@visx/mock-data/lib/generators/genBins';
import { scaleLinear } from '@visx/scale';
import { HeatmapCircle, HeatmapRect } from '@visx/heatmap';
import { getSeededRandom } from '@visx/mock-data';

interface adjacencyList {
  [from: string] : number
}

interface adjacencySignature {
  [to: string] : adjacencyList
}

const client = new W3CWebSocket('ws://127.0.0.1:8080')

const hot1 = '#77312f';
const hot2 = '#f33d15';
const cool1 = '#122549';
const cool2 = '#b4fbde';
export const background = '#28272c';

const seededRandom = getSeededRandom(0.41);

var initBins = genBins(
  /* length = */ 100,
  /* height = */ 100,
  /** binFunc */ idx => idx,
  /** countFunc */ (i, number) => 128,
);

function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.max(...data.map(value));
}

function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.min(...data.map(value));
}

function updateBin<Datum> (data: Datum[], adjacencyMap: adjacencySignature) {
  // const seed = getSeededRandom(Math.random());
  let pool = Object.entries(adjacencyMap).reduce( (a: adjacencyList,x,i) => {
    a[x[0]] = 0 //typeof a[x[0]] != 'undefined' ? a[x[0]] + 1 : 0;
    Object.entries(x[1]).map( y => a[y[0]] = 0)
    return a
  }, {} )

  let poolMatrix = Object.entries(pool).reduce( (a: adjacencySignature, x, i) => {
    a[x[0]] = { ...pool }
    return a
  }, {})

  const populated = Object.entries(adjacencyMap).reduce( (p: adjacencySignature,x,i) => {
    const bin = Object.entries(x[1]);
    bin.map( y => p[x[0]][y[0]] = y[1])
    // delete p['undefined']
    return p
  }, poolMatrix )

  // console.log('pool', pool)
  // console.log('poolMatrix', poolMatrix)
  // console.log('populated', populated ); 
  // console.log('data', data);

  const updated = Object.entries(populated).map( (x,i) => ( { bin: i, bins: Object.entries(x[1]).map( (y, j) => ({ bin: j, count: y[1] * 25, from: x[0], to: y[0]}) ) }  ) )

  // console.log('updated', updated)
  // console.log('data.length', data.length)
  // data.map( x => console.log(typeof x))

  return updated
}

// accessors
const bins = (d: Bins) => d.bins;
const count = (d: Bin) => d.count;



export type HeatmapProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  separation?: number;
  events?: boolean;
};

const defaultMargin = { top: 10, left: 20, right: 20, bottom: 110 };

const App = ({
  width,
  height,
  events = false,
  margin = defaultMargin,
  separation = 20,
}: HeatmapProps) => {

  const [binData, setBinData] = useState(initBins);
  const [colorMax, setColorMax] = useState(max(initBins, d => max(bins(d), count)));
  const [bucketSizeMax, setBucketSizeMax] = useState(max(initBins, d => bins(d).length));
  const [adjacencyMap, setAdjacencyMap] = useState({})
  // const [size, setSize] = useState(width > margin.left + margin.right ? width - margin.left - margin.right - separation : width)

  // scales
  var xScale = scaleLinear<number>({
    domain: [0, binData.length],
  })

  var yScale = scaleLinear<number>({
    domain: [0, bucketSizeMax],
  });

  var circleColorScale = scaleLinear<string>({
    range: [hot1, hot2],
    domain: [0, colorMax],
  });
  var rectColorScale = scaleLinear<string>({
    range: [cool1, cool2],
    domain: [0, colorMax],
  });
  var opacityScale = scaleLinear<number>({
    range: [0.1, 1],
    domain: [0, colorMax],
  });

  useEffect(() => {

    console.log('useEffect')

    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const parsed = JSON.parse(message.data.toString())
      const from: string = parsed.result.from;
      const to: string = parsed.result.to;
      console.log('from', from, ' to ', to); 

     setAdjacencyMap( (m: adjacencySignature) => {
        m[from] = m[from] ? m[from] : {}
        m[from][to] = m[from][to] ? m[from][to] + 1 : 1;
        return m
       } )
      // console.log('adjacencyMap', adjacencyMap)
      setBinData( b => updateBin(b, adjacencyMap));
      setBucketSizeMax(max(binData, d => bins(d).length));
      setColorMax(max(binData, d => max(bins(d), count)));
      setBucketSizeMax(max(binData, d => bins(d).length));
      xScale = scaleLinear<number>({
        domain: [0, binData.length],
      })
    
      yScale = scaleLinear<number>({
        domain: [0, bucketSizeMax],
      });
    
      circleColorScale = scaleLinear<string>({
        range: [hot1, hot2],
        domain: [0, colorMax],
      });
      rectColorScale = scaleLinear<string>({
        range: [cool1, cool2],
        domain: [0, colorMax],
      });
      opacityScale = scaleLinear<number>({
        range: [0.1, 1],
        domain: [0, colorMax],
      });
      
      size = width > margin.left + margin.right ? width - margin.left - margin.right - separation : width;
      xMax = size / 2;
      yMax = height - margin.bottom - margin.top;
      binWidth = xMax / binData.length;
      binHeight = yMax / bucketSizeMax;
      radius = min([binWidth, binHeight], d => d) / 2;
      xScale.range([0, xMax]);
      yScale.range([yMax, 0]);
    };
  }, []);
  // bounds
  var size = width > margin.left + margin.right ? width - margin.left - margin.right - separation : width;
  var xMax = size / 2;
  var yMax = height - margin.bottom - margin.top;

  var binWidth = xMax / binData.length;
  var binHeight = yMax / bucketSizeMax;
  var radius = min([binWidth, binHeight], d => d) / 2;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} rx={14} fill={background} />
      <Group top={margin.top} left={margin.left}>
        <text><tspan font-weight="bold" font-size="40px" x="40" y="40" fill="white">Realtime Transactions Visualization</ tspan></text>
      </Group>
      <Group top={margin.top} left={xMax + margin.left + separation}>
        <HeatmapRect
          data={binData}
          xScale={d => xScale(d) ?? 0}
          yScale={d => yScale(d) ?? 0}
          colorScale={rectColorScale}
          opacityScale={opacityScale}
          binWidth={binWidth}
          binHeight={binHeight}
          gap={2}
        >
          {heatmap =>
            heatmap.map(heatmapBins =>
              heatmapBins.map(bin => (
                <rect
                  key={`heatmap-rect-${bin.row}-${bin.column}`}
                  className="visx-heatmap-rect"
                  width={bin.width}
                  height={bin.height}
                  x={bin.x}
                  y={bin.y}
                  fill={bin.color}
                  fillOpacity={bin.opacity}
                  onClick={() => {
                    // if (!events) return;
                    const { row, column } = bin;
                    alert(JSON.stringify({ row, column, bin: bin.bin }));
                  }}
                />
              )),
            )
          }
        </HeatmapRect>
      </Group>
    </svg>
  );
};

export default App;