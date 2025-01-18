FROM eclipse-mosquitto:2.0
COPY config/mosquitto.conf /mosquitto/config/mosquitto.conf
COPY config/acl_file.conf /mosquitto/config/acl_file.conf
RUN chmod 700 /mosquitto/config/acl_file.conf
EXPOSE 1883