
import './App.css'
import { useEffect, useState } from 'react'
import mqtt from 'mqtt'

function App() {
  const [temperature, setTemperature] = useState<number>(0)
  const [humidity, setHumidity] = useState<number>(0)
  const [ammoniaGas, setAmmoniaGas] = useState<number>(0)
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...')

  useEffect(() => {
    // Connect to MQTT broker via WebSocket
    // Configuration is loaded from environment variables
    // For local development: ws://localhost:9001 (Docker)
    // For production: ws://YOUR_SERVER_IP:9001
    const brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://150.109.25.181:9001'
    const reconnectPeriod = parseInt(import.meta.env.VITE_MQTT_RECONNECT_PERIOD || '5000')
    
    console.log(`Connecting to MQTT broker at: ${brokerUrl}`)
    
    const client = mqtt.connect(brokerUrl, {
      clientId: 'sibebek-web-' + Math.random().toString(16).substring(2, 8),
      clean: true,
      reconnectPeriod: reconnectPeriod,
      rejectUnauthorized: false
    })

    client.on('connect', () => {
      console.log('Connected to MQTT broker')
      setConnectionStatus('Connected')
      
      // Subscribe to topics
      client.subscribe('sibebek/temperature', (err) => {
        if (err) console.error('Failed to subscribe to temperature topic:', err)
      })
      
      client.subscribe('sibebek/humidity', (err) => {
        if (err) console.error('Failed to subscribe to humidity topic:', err)
      })
      
      client.subscribe('sibebek/ammonia', (err) => {
        if (err) console.error('Failed to subscribe to ammonia topic:', err)
      })
    })

    client.on('message', (topic, message) => {
      const value = parseFloat(message.toString())
      
      console.log(`Received message on ${topic}: ${value}`)
      
      if (topic === 'sibebek/temperature') {
        setTemperature(value)
      } else if (topic === 'sibebek/humidity') {
        setHumidity(value)
      } else if (topic === 'sibebek/ammonia') {
        setAmmoniaGas(value)
      }
    })

    client.on('error', (err) => {
      console.error('MQTT connection error:', err)
      setConnectionStatus('Connection Error')
    })

    client.on('reconnect', () => {
      console.log('Reconnecting to MQTT broker...')
      setConnectionStatus('Reconnecting...')
    })

    client.on('offline', () => {
      console.log('MQTT client offline')
      setConnectionStatus('Offline')
    })

    // Cleanup on unmount
    return () => {
      client.end()
    }
  }, [])

  const getRecommendations = () => {
    const recommendations = []
    
    // Temperature recommendations
    if (temperature >= 0 && temperature < 17) {
      recommendations.push('Turn on the room heater (temperature is too low).')
    }
    if (temperature > 22) {
      recommendations.push('Turn on the fan or give cold water to the ducks (temperature is too high).')
    }

    // Humidity recommendations
    if (humidity >= 0 && humidity < 60) {
      recommendations.push('Turn on the fan or give cold water to the ducks (humidity is too low).')
    }
    if (humidity > 80) {
      recommendations.push('Turn on the room heater (humidity is too high).')
    }

    // Ammonia gas recommendations
    if (ammoniaGas > 24) {
      recommendations.push('Immediately clean the duck feces (ammonia gas level is too high).')
    }

    if (recommendations.length === 0) {
      recommendations.push('All conditions are optimal. No action needed.')
    }

    return recommendations
  }

  return (
    <>
      <div id="main" className='bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen'>
        <div className="container mx-auto max-w-6xl">
          <div id="main-content" className='py-12 px-4'>
            <div className='text-center mb-12'>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">🦆 Sibebek Farm Monitoring</h1>
              <p className='text-gray-600'>Real-time environmental monitoring system</p>
              <div className='mt-3 flex items-center justify-center gap-2'>
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className='text-sm text-gray-500'>{connectionStatus}</span>
              </div>
            </div>

            <div id="stats" className='grid md:grid-cols-3 gap-6 mb-8'>
              <div id="content-left" className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5a4 4 0 1 1 8 0v5.255a7 7 0 1 1-8 0zm1.144 6.895a5 5 0 1 0 5.712 0L14 11.298V5a2 2 0 1 0-4 0v6.298zm1.856.231V5h2v7.126A4.002 4.002 0 0 1 12 20a4 4 0 0 1-1-7.874M12 18a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/></svg>
                  </div>
                </div>
                <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Temperature</h2>
                <p className='text-4xl font-bold text-gray-800'>{temperature.toFixed(1)}<span className='text-2xl text-gray-500'>°C</span></p>
              </div>

              <div id="content-middle" className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M14.5 18q.625 0 1.063-.437T16 16.5t-.437-1.062T14.5 15t-1.062.438T13 16.5t.438 1.063T14.5 18m-5.05-.05l6.5-6.5l-1.4-1.4l-6.5 6.5zM9.5 13q.625 0 1.063-.437T11 11.5t-.437-1.062T9.5 10t-1.062.438T8 11.5t.438 1.063T9.5 13m2.5 9q-3.425 0-5.712-2.35T4 13.8q0-2.5 1.988-5.437T12 2q4.025 3.425 6.013 6.363T20 13.8q0 3.5-2.287 5.85T12 22m0-2q2.6 0 4.3-1.763T18 13.8q0-1.825-1.513-4.125T12 4.65Q9.025 7.375 7.513 9.675T6 13.8q0 2.675 1.7 4.438T12 20m0-8"/></svg>
                  </div>
                </div>
                <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Humidity</h2>
                <p className='text-4xl font-bold text-gray-800'>{humidity.toFixed(1)}<span className='text-2xl text-gray-500'>%</span></p>
              </div>

              <div id="content-right" className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m-5.5-2.5l7.51-3.49L17.5 6.5L9.99 9.99z"/></svg>
                  </div>
                </div>
                <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Ammonia Gas</h2>
                <p className='text-4xl font-bold text-gray-800'>{ammoniaGas.toFixed(1)}<span className='text-2xl text-gray-500'> ppm</span></p>
              </div>
            </div>

            <div id="recommendation" className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg>
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-800'>Recommendations</h2>
                  <p className='text-sm text-gray-500'>Automated suggestions based on current conditions</p>
                </div>
              </div>
              
              <div className='space-y-3'>
                {getRecommendations().map((recommendation, index) => (
                  <div key={index} className='flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
                    <div className='mt-0.5'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className='text-blue-600'>
                        <path d="M9 12l2 2l4-4m6 2a9 9 0 1 1-18 0a9 9 0 0 1 18 0"/></svg>
                    </div>
                    <p className='text-gray-700 leading-relaxed flex-1'>{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default App
