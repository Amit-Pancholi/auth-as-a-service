FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/nginx.conf
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://nginx-server/health || exit 1
EXPOSE 81
CMD ["nginx", "-g", "daemon off;"]