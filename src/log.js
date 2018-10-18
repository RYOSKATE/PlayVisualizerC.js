import Stopwatch from './stopwatch';
const stopwatch = new Stopwatch();
export const restartLogging = () => {
    stopwatch.restart();
    localStorage.step = -1;
};

export const stopLogging = () => {
    stopwatch.stop();
};

export const isLogging = () => {
    return stopwatch.isRunning();
};

export const addLog = (text) => {
    const logs = window.GlobalStorage.log;
    const time = stopwatch.seconds().toFixed(2);
    const step = localStorage.step;
    let previousTime = 0;
    if(1 < logs.length){
        const log = logs[logs.length - 1];
        previousTime = Number(log.time);
    }
    const spent = Number(time) - previousTime;
    window.GlobalStorage.log.push({time, text, step, spent});
};

export const flushLogToSave = () => {
    const text = JSON.stringify(window.GlobalStorage.log);
    if(localStorage.logtext !== '[') {
        localStorage.logtext += ',\n';
    }
    localStorage.logtext += text;
    console.log(localStorage);
};
