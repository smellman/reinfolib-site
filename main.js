import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import maplibregl, {addProtocol} from 'maplibre-gl'
import MaplibreInspect from '@maplibre/maplibre-gl-inspect'

const apikey = 'your-api-key-here'

maplibregl.addProtocol('reinfolib', async (params, abortController) => {
  // Not working now
  // const headers = {
  //   'Ocp-Apim-Subscription-Key': apikey
  // }
  // const url = `https://${params.url.split("://")[1]}`
  // const response = await fetch(url, {headers, signal: abortController.signal})
  const url = `http://127.0.0.1:8000/proxy/${params.url.split("://")[1]}`
  const response = await fetch(url, {signal: abortController.signal})
  if (response.status == 200) {
    const buffer = await response.arrayBuffer()
    return {data: buffer}
  } else {
    throw new Error(`Tile fetch error: ${response.statusText}`)
  }
})


const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tile.openstreetmap.jp/styles/maptiler-toner-ja/style.json',
  center: [139.767, 35.681],
  zoom: 13,
  hash: true,
})

map.addControl(new maplibregl.NavigationControl(), 'top-left')
map.addControl(new MaplibreInspect({
  showInspectMap: false,
  popup: new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
  }),
}), 'top-left')

map.on('load', async () => {
  const image = await map.loadImage('https://maplibre.org/maplibre-gl-js/docs/assets/custom_marker.png');
  map.addImage('custom-marker', image.data);
  map.addSource('reinfolib', {
    type: 'vector',
    tiles: ['reinfolib://ex-api/external/XPT001?response_format=pbf&z={z}&x={x}&y={y}&from=20183&to=20234'],
    // Not working now
    // tiles: ['reinfolib://www.reinfolib.mlit.go.jp/ex-api/external/XPT001?response_format=pbf&z={z}&x={x}&y={y}&from=20183&to=20234'],
    minzoom: 11,
    maxzoom: 15,
    attribution: '<a href="https://www.reinfolib.mlit.go.jp/">国土交通省 不動産情報ライブラリ</a>'
  })
  console.log(map.getSource('reinfolib'))
  map.addLayer({
    id: 'reinfolib-points',
    type: 'symbol',
    source: 'reinfolib',
    'source-layer': 'hits',
    layout: {
      'icon-image': 'custom-marker',
      'icon-size': 0.5,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    }
  })
  map.on('click', 'reinfolib-points', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice()
    const properties = e.features[0].properties

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
    }
    let description = ''
    for (const [key, value] of Object.entries(properties)) {
      description += `<strong>${key}</strong>: ${value}`
    }

    new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
  })

  map.on('mouseenter', 'reinfolib-points', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'reinfolib-points', () => {
    map.getCanvas().style.cursor = ''
  })
})