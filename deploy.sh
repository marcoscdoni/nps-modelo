#!/bin/bash

# NPS Modelo - Quick Deploy Script for Hetzner VPS
# This script helps with common deployment tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running on server
check_environment() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found. Are you in the correct directory?"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please create it first."
        exit 1
    fi
}

# Update application
update_app() {
    print_info "Pulling latest image from Docker Hub..."
    docker compose pull
    
    print_info "Restarting containers..."
    docker compose up -d
    
    print_success "Application updated successfully!"
    
    print_info "Recent logs:"
    docker compose logs --tail=20
}

# View logs
view_logs() {
    local lines=${1:-100}
    docker compose logs --tail=$lines -f
}

# Check status
check_status() {
    print_info "Container Status:"
    docker compose ps
    echo ""
    
    print_info "Resource Usage:"
    docker stats --no-stream
    echo ""
    
    print_info "Disk Usage:"
    docker system df
}

# Clean old images
clean_docker() {
    print_info "Cleaning old Docker images..."
    docker image prune -f
    
    print_info "Cleaning Docker system..."
    docker system prune -f
    
    print_success "Cleanup completed!"
    docker system df
}

# Restart application
restart_app() {
    print_info "Restarting application..."
    docker compose restart
    print_success "Application restarted!"
    
    print_info "Checking status..."
    docker compose ps
}

# Stop application
stop_app() {
    print_info "Stopping application..."
    docker compose down
    print_success "Application stopped!"
}

# Start application
start_app() {
    print_info "Starting application..."
    docker compose up -d
    print_success "Application started!"
    
    print_info "Checking status..."
    docker compose ps
}

# Backup env file
backup_env() {
    local backup_file=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$backup_file"
    print_success "Environment backed up to: $backup_file"
}

# Show menu
show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   NPS Modelo - Deployment Manager     ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "1) Update Application (pull + restart)"
    echo "2) View Logs"
    echo "3) Check Status"
    echo "4) Restart Application"
    echo "5) Stop Application"
    echo "6) Start Application"
    echo "7) Clean Old Images"
    echo "8) Backup .env File"
    echo "9) Exit"
    echo ""
}

# Main menu
main() {
    check_environment
    
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Choose an option: " choice
            
            case $choice in
                1)
                    update_app
                    ;;
                2)
                    read -p "Number of lines to show (default 100): " lines
                    view_logs ${lines:-100}
                    ;;
                3)
                    check_status
                    ;;
                4)
                    restart_app
                    ;;
                5)
                    stop_app
                    ;;
                6)
                    start_app
                    ;;
                7)
                    clean_docker
                    ;;
                8)
                    backup_env
                    ;;
                9)
                    print_info "Goodbye!"
                    exit 0
                    ;;
                *)
                    print_error "Invalid option!"
                    ;;
            esac
            
            echo ""
            read -p "Press Enter to continue..."
        done
    else
        # Command line arguments
        case "$1" in
            update)
                update_app
                ;;
            logs)
                view_logs ${2:-100}
                ;;
            status)
                check_status
                ;;
            restart)
                restart_app
                ;;
            stop)
                stop_app
                ;;
            start)
                start_app
                ;;
            clean)
                clean_docker
                ;;
            backup)
                backup_env
                ;;
            *)
                echo "Usage: $0 {update|logs|status|restart|stop|start|clean|backup}"
                echo "Or run without arguments for interactive menu"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"
