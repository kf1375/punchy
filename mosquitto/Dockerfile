FROM eclipse-mosquitto:1.6.15-openssl
COPY config/mosquitto.conf /mosquitto/config/mosquitto.conf
COPY config/acl_file.conf /mosquitto/config/acl_file.conf
RUN chmod 700 /mosquitto/config/acl_file.conf
EXPOSE 1883