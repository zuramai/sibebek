# Sibebek Farm Monitoring System

A real-time IoT monitoring system for duck farm environmental conditions using ESP8266, MQTT, and React.

## Quick Start

```bash
# 1. Start MQTT broker
./mqtt.sh start

# 2. Start web app
cd sibebek
bun run dev

# 3. Upload ESP8266 firmware (see QUICKSTART.md)
```

**MQTT Topics:**
- `sibebek/temperature` - Temperature in °C
- `sibebek/humidity` - Humidity in %
- `sibebek/ammonia` - Ammonia gas in ppm

## Configuration

### Environment Variables (Web App)

Create `sibebek/.env`:

```env
# Local development
VITE_MQTT_BROKER_URL=ws://localhost:9001

# Production
# VITE_MQTT_BROKER_URL=ws://150.109.25.181:9001

VITE_MQTT_RECONNECT_PERIOD=5000
```

### ESP8266 Configuration

Edit `sibebek.ino`:

```cpp
// WiFi
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker
const char* mqtt_server = "192.168.1.100";  // Your broker IP
const int mqtt_port = 1883;
```

## Management Commands

```bash
Usage: ./mqtt.sh [command]

Commands:
  start       - Start the MQTT broker
  stop        - Stop the MQTT broker
  restart     - Restart the MQTT broker
  status      - Check broker status
  logs        - View broker logs
  subscribe   - Subscribe to all topics
  test        - Publish test data
  clients     - Show connected clients
  help        - Show this help message

Examples:
  ./mqtt.sh start       # Start the broker
  ./mqtt.sh subscribe   # Listen to all messages
  ./mqtt.sh test        # Send test data

# Web App
cd sibebek
bun run dev          # Development server
bun run build        # Production build
bun run preview      # Preview build
```

## Testing

### Test without hardware:

```bash
# Terminal 1: Monitor messages
./mqtt.sh subscribe

# Terminal 2: Send test data
./mqtt.sh test
```

### Test with ESP8266:

1. Open Arduino Serial Monitor (115200 baud)
2. Watch for sensor readings and MQTT publish confirmations
3. Open web app in browser
4. Verify real-time updates

## Security (Production)

For production deployment:

1. **Enable MQTT Authentication**
   ```bash
   docker exec -it sibebek-mosquitto mosquitto_passwd -c /mosquitto/config/passwd admin
   ```

2. **Update mosquitto.conf**
   ```conf
   allow_anonymous false
   password_file /mosquitto/config/passwd
   ```

3. **Use SSL/TLS**
   - Configure certificates in mosquitto.conf
   - Update client connections to use `wss://` and `mqtts://`

4. **Firewall Rules**
   - Limit access to ports 1883 and 9001
   - Use VPN for remote access

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[README_MOSQUITTO.md](./README_MOSQUITTO.md)** - Mosquitto broker guide
- **[MQTT_SETUP.md](./MQTT_SETUP.md)** - MQTT architecture details


### Arduino Libraries
- ESP8266WiFi
- PubSubClient
- Adafruit DHT Sensor Library
- Adafruit Unified Sensor
