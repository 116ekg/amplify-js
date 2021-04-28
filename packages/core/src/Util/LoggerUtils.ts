import winston, { Logger } from "winston";
import { CloudWatchTransport, CloudWatchTransportProps } from "../Logger";

const getCloudWatchLogger = (params: CloudWatchTransportProps): Logger => {
    const { logGroupName, logStreamName, name, region } = params;
    const logger = winston.createLogger({
        transports: [
            new CloudWatchTransport({
                name,
                logGroupName,
                logStreamName,
                region,
            }),
        ],
    });

    return logger;
}

export { getCloudWatchLogger };
