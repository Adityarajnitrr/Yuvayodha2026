# Gunicorn configuration for production deployment
# Used by Render, Railway, Heroku, etc.

import os

# Bind to the port provided by the hosting service
bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"

# Number of worker processes
workers = 2

# Worker class
worker_class = 'sync'

# Timeout for requests (in seconds)
timeout = 120

# Max requests per worker before restart (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = '-'  # Log to stdout
errorlog = '-'   # Log to stderr
loglevel = 'info'

# Preload app to save memory
preload_app = True
