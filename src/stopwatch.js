/**
 * Created by khlee on 11/8/16.
 */
export default class Stopwatch {
    constructor(display, results) {
        this.running = false;
        this.display = display;
        this.results = results;
        this.laps = [];
        this.reset();
        this.print();
    }

    reset() {
        this.times = [ 0, 0, 0];
    }

    isRunning() {
        return this.running;
    };

    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    lap() {
        const times = this.times;
        if (this.running) {
            this.reset();
        }
        if(this.results){
            const li = document.createElement('li');
            li.innerText = this.format(times);        
            this.results.appendChild(li);
        }
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    restart() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
        this.reset();
    }

    clear() {
        if(this.results){
            clearChildren(this.results);
        }      
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[2] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    print() {
        if(this.display){
            this.display.innerText = this.format(this.times);
        }        
    }

    pad0(num) {
        return ('00' + num).slice(-2);
    };

    format(times) {
        return `${this.pad0(times[0], 2)}:${this.pad0(times[1], 2)}:${this.pad0(Math.floor(times[2]), 2)}`;
    }

    seconds(){
        return this.times[0] *60 + this.times[1] + this.times[2] / 100;
    }
}
