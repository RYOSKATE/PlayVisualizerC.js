import Stopwatch from './stopwatch';
const stopwatch = new Stopwatch();
export const restartLogging = () => {
    stopwatch.restart();
};

export const stopLogging = () => {
    stopwatch.stop();
};

export const isLogging = () => {
    return stopwatch.isRunning();
};

export const addLog = (text) => {
    const time = stopwatch.seconds().toFixed(2);
    window.GlobalStorage.log.push({time, text});
};

export const flushLogToSave = () => {
    const text = JSON.stringify(window.GlobalStorage.log);
    if(localStorage.logtext !== '[') {
        localStorage.logtext += ',\n';
    }
    localStorage.logtext += text;
};
