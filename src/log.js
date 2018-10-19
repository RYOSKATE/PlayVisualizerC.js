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

export const addLog = (text, step) => {
    const logs = window.GlobalStorage.log;
    const time = Number(stopwatch.seconds().toFixed(2));
    let previousTime = 0;
    if(1 < logs.length){
        const log = logs[logs.length - 1];
        previousTime = Number(log.time);
    }
    if (typeof step === "undefined") {
        step = -1;
    }
    const spent = Number((Number(time) - previousTime).toFixed(2));
    window.GlobalStorage.log.push({time, text, step, spent});
};

export const flushLogToSave = () => {
    const text = JSON.stringify(window.GlobalStorage.log);
    if(typeof localStorage.logtext === 'undefined') {
        localStorage.logtext = '[';
    } else if(localStorage.logtext !== '[') {
        localStorage.logtext += ',\n';
    }
    localStorage.logtext += text;
    console.log(localStorage);
};
