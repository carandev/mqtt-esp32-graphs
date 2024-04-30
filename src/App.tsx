import { useEffect, useState } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import './App.css'
import mqtt from 'mqtt'

interface Data {
  time: string;
  temperature: string;
  humidity: string | null
}

function App() {

  const [data, setData] = useState<Data[]>([])

  useEffect(() => {
    const clientId = "emqx_react_" + Math.random().toString(16).substring(2, 8);
    const username = "admin";
    const password = "admin";

    const client = mqtt.connect("wss://f810715c.ala.us-east-1.emqxsl.com:8084/mqtt", {
      clientId,
      username,
      password,
    });

    const topicTemp = '/data/temp';
    const topicHum = '/data/hum';

    client.on('connect', () => {
      console.log('Conectado al broker');
      client.subscribe(topicTemp, (err) => {
        if (!err) {
          console.log(`Suscrito al topic: ${topicTemp}`);
        } else {
          console.error('Error al suscribirse al topic:', err);
        }
      });
    });

    client.on('connect', () => {
      console.log('Conectado al broker');
      client.subscribe(topicHum, (err) => {
        if (!err) {
          console.log(`Suscrito al topic: ${topicHum}`);
        } else {
          console.error('Error al suscribirse al topic:', err);
        }
      });
    });


    client.on("message", (topic: string, message) => {
      // Función para manejar el mensaje recibido
      const payload = message.toString()

      if (topic === topicTemp) {
        setData((prevData) => [...prevData, { time: new Date().toLocaleTimeString(), temperature: payload, humidity: null }])
      }

      if (topic === topicHum) {
        setData(prevData => prevData.map((item, index) => {
          if (index === prevData.length - 1) {
            return { ...item, humidity: payload }
          }
          return item
        }))
      }
    });

    return () => {
      client.end();
    }

  }, [])

  return (
    <>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
        <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
      </LineChart>
    </>
  )
}

export default App
