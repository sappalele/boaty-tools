export const logger = {
  info: (message?: any, ...optionalParams: any[]) => {
    console.log(message, optionalParams);
    process.parentPort.postMessage({
      type: "LOG",
      data: {
        level: "INFO",
        message: JSON.stringify(
          optionalParams ? [message, ...optionalParams] : message
        ),
      },
    });
  },
  error: (message?: any, ...optionalParams: any[]) => {
    console.error(message, optionalParams);
    process.parentPort.postMessage({
      type: "LOG",
      data: {
        level: "ERROR",
        message: JSON.stringify(
          optionalParams ? [message, ...optionalParams] : message
        ),
      },
    });
  },
  warn: (message?: any, ...optionalParams: any[]) => {
    console.warn(message, optionalParams);
    process.parentPort.postMessage({
      type: "LOG",
      data: {
        level: "WARN",
        message: JSON.stringify(
          optionalParams ? [message, ...optionalParams] : message
        ),
      },
    });
  },
  debug: (message?: any, ...optionalParams: any[]) => {
    console.debug(message, optionalParams);
    process.parentPort.postMessage({
      type: "LOG",
      data: {
        level: "DEBUG",
        message: JSON.stringify(
          optionalParams ? [message, ...optionalParams] : message
        ),
      },
    });
  },
  log: (message?: any, ...optionalParams: any[]) => {
    console.log(message, optionalParams);
    process.parentPort.postMessage({
      type: "LOG",
      data: {
        level: "INFO",
        message: JSON.stringify(
          optionalParams ? [message, ...optionalParams] : message
        ),
      },
    });
  },
};
