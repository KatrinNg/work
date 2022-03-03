FROM docker-registry.default.svc:5000/openshift/nginx:1.12
COPY ./build /opt/app-root

USER root
RUN chgrp -R 0 /opt/app-root/ && \
    chmod -R g=u /opt/app-root/
CMD ["nginx", "-g", "daemon off;"]