map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
}

server {
  listen 80;
  server_name localhost;
  root   /path/to/frontend/dist/folder;;
  index  index.html;

  # asset matching
  # https://router.vuejs.org/en/essentials/history-mode.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Vue router matching
  # If no asset matches, send it to your javascript app. Hopefully it's a route in the app!
  location @rewrites {
    rewrite ^(.+)$ /index.html last;
  }

  location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|ttf)$ {
    # Some basic cache-control for static files to be sent to the browser
    expires max;
    add_header Pragma public;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
  }

    location /api {
            proxy_pass http://127.0.0.1:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade; #for websockets
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header Host $host;
  }
     location /recommender/batchRecommender {
            proxy_pass http://127.0.0.1:8080/recommender/batchRecommender;
            proxy_http_version 1.1;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header Host $host;
			add_header "Access-Control-Allow-Origin" "*";
			add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
			add_header 'Access-Control-Allow-Headers' 'X-Requested-With,Accept,Content-Type, Origin';
  }
}

