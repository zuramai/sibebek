#!/bin/bash

# Sibebek MQTT Broker Management Script
# =====================================

set -e

PROJECT_NAME="sibebek-mosquitto"
COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if docker and docker-compose are installed
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Start the MQTT broker
start_broker() {
    print_info "Starting Mosquitto MQTT broker..."
    docker-compose up -d
    sleep 2
    if docker ps | grep -q "$PROJECT_NAME"; then
        print_success "Mosquitto broker started successfully!"
        print_info "MQTT Port: 1883 (ESP8266)"
        print_info "WebSocket Port: 9001 (Web Browser)"
    else
        print_error "Failed to start broker. Check logs with: ./mqtt.sh logs"
        exit 1
    fi
}

# Stop the MQTT broker
stop_broker() {
    print_info "Stopping Mosquitto MQTT broker..."
    docker-compose down
    print_success "Mosquitto broker stopped"
}

# Restart the broker
restart_broker() {
    print_info "Restarting Mosquitto MQTT broker..."
    docker-compose restart
    print_success "Mosquitto broker restarted"
}

# View logs
view_logs() {
    print_info "Showing Mosquitto logs (Ctrl+C to exit)..."
    docker-compose logs -f mosquitto
}

# Check status
check_status() {
    if docker ps | grep -q "$PROJECT_NAME"; then
        print_success "Mosquitto broker is running"
        docker-compose ps
    else
        print_warning "Mosquitto broker is not running"
    fi
}

# Subscribe to all topics
subscribe_all() {
    print_info "Subscribing to all sibebek topics (Ctrl+C to exit)..."
    docker exec -it "$PROJECT_NAME" mosquitto_sub -h localhost -p 1883 -t "sibebek/#" -v
}

# Publish test data
publish_test() {
    print_info "Publishing test data..."
    docker exec -it "$PROJECT_NAME" mosquitto_pub -h localhost -p 1883 -t "sibebek/temperature" -m "25.5"
    docker exec -it "$PROJECT_NAME" mosquitto_pub -h localhost -p 1883 -t "sibebek/humidity" -m "65.0"
    docker exec -it "$PROJECT_NAME" mosquitto_pub -h localhost -p 1883 -t "sibebek/ammonia" -m "15.0"
    print_success "Test data published!"
}

# Show connected clients
show_clients() {
    print_info "Connected clients:"
    docker exec -it "$PROJECT_NAME" mosquitto_sub -h localhost -p 1883 -t '$SYS/broker/clients/connected' -C 1
}

# Show help
show_help() {
    echo "Sibebek MQTT Broker Management"
    echo "=============================="
    echo ""
    echo "Usage: ./mqtt.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start the MQTT broker"
    echo "  stop        - Stop the MQTT broker"
    echo "  restart     - Restart the MQTT broker"
    echo "  status      - Check broker status"
    echo "  logs        - View broker logs"
    echo "  subscribe   - Subscribe to all topics"
    echo "  test        - Publish test data"
    echo "  clients     - Show connected clients"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./mqtt.sh start       # Start the broker"
    echo "  ./mqtt.sh subscribe   # Listen to all messages"
    echo "  ./mqtt.sh test        # Send test data"
}

# Main script
main() {
    check_requirements

    case "${1:-help}" in
        start)
            start_broker
            ;;
        stop)
            stop_broker
            ;;
        restart)
            restart_broker
            ;;
        status)
            check_status
            ;;
        logs)
            view_logs
            ;;
        subscribe)
            subscribe_all
            ;;
        test)
            publish_test
            ;;
        clients)
            show_clients
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"

