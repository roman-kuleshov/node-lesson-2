class TimersManager {
  constructor() {
    this.timers = [];
    this._log = [];

    this.timersManagerDelay = 1000 * 10;
  }

  log(item) {
    this._log = [...this._log, item];
  }

  startTimer(timer, delay) {
    const timerMethod = timer.config.interval ? 'setInterval' : 'setTimeout';
    const instance = global[timerMethod](() => {
      let out, error;
      let logItem = {
        name: timer.config.name,
        in: timer.args,
        created: new Date(),
      };

      try {
        out = timer.config.job(...timer.args);
      } catch (e) {
        error = {
          name: e.name,
          message: e.message,
          stack: e.stack,
        };
        logItem = {
          ...logItem,
          error,
        };
      } finally {
        this.log({
          ...logItem,
          out,
        });
      }
    }, delay);

    return instance;
  }

  print() {
    return this._log;
  }

  add(config, ...args) {
    this.validate(config);

    this.timers = [
      ...this.timers,
      {
        config,
        args,
        instance: null,
        timeStarted: null,
        timePaused: null,
      },
    ];

    return this;
  }

  validate({ name, delay, interval, job }) {
    if (this.timers.find(({ config }) => config.name === name)) {
      throw new Error(`The timer with name '${name}' already exists`);
    }

    if (!name || typeof name !== 'string') {
      throw new Error('Name has incorrect value');
    }

    if (typeof delay !== 'number') {
      throw new Error('Delay has incorrect value');
    }

    if (delay < 0 || delay > 5000) {
      throw new Error('Delay has incorrect value');
    }

    if (typeof interval !== 'boolean') {
      throw new Error('interval has to be a boolean type');
    }

    if (typeof job !== 'function') {
      throw new Error('Job has to be a function');
    }
  }

  remove(config) {
    const timerToRemove = this.timers.find((timer) => timer.config === config);

    if (timerToRemove) {
      this.clearTimer(timerToRemove);
      this.timers = this.timers.filter((timer) => timer.config !== timerToRemove.config);
    }

    return this;
  }

  start() {
    this.timers = this.timers.map((timer) => {
      // stop if it's running, depends on the requirements
      this.clearTimer(timer);

      const instance = this.startTimer(timer, timer.config.delay);

      return {
        ...timer,
        instance,
        timeStarted: new Date(),
      };
    });

    this.clearAllTimers();
  }

  stop() {
    this.timers = this.timers.map((timer) => {
      this.clearTimer(timer);

      return {
        ...timer,
        instance: null,
        timeStarted: null,
        timePaused: null,
      };
    });
  }

  pause(config) {
    const timerToPause = this.timers.find(
      (timer) => timer.config === config && Boolean(timer.timeStarted),
    );

    if (timerToPause) {
      this.timers = this.timers.map((timer) => {
        if (timerToPause.config === timer.config) {
          this.clearTimer(timer);

          return {
            ...timer,
            instance: null,
            timePaused: new Date(),
          };
        }

        return timer;
      });
    }

    return this;
  }

  resume(config) {
    const timerToResume = this.timers.find(
      (timer) => timer.config === config && Boolean(timer.timePaused),
    );

    if (timerToResume) {
      this.timers = this.timers.map((timer) => {
        if (timerToResume.config === timer.config) {
          const delay =
            timer.config.delay - (timer.timePaused.getTime() - timer.timeStarted.getTime());
          const instance = this.startTimer(timer, delay);

          return {
            ...timer,
            instance,
            timeStarted: new Date(),
            timePaused: null,
          };
        }

        return timer;
      });
    }

    return this;
  }

  clearTimer(timer) {
    if (timer.instance) {
      const clearMethod = timer.config.interval ? 'clearInterval' : 'clearTimeout';

      global[clearMethod](timer.instance);
    }
  }

  clearAllTimers() {
    const maxDelay = Math.max(...this.timers.map(({ config }) => config.delay));

    setTimeout(() => {
      this.timers.forEach((timer) => {
        this.clearTimer(timer);
      });

      this.timers = [];
    }, maxDelay + this.timersManagerDelay);
  }
}

const manager = new TimersManager();

const t1 = {
  name: 't1',
  delay: 1000,
  interval: false,
  job: (a, b) => 't1' + a + b,
};

const t2 = {
  name: 't2',
  delay: 3000,
  interval: true,
  job: (a, b) => 't2' + a + b,
};

const t3 = {
  name: 't3',
  delay: 2000,
  interval: false,
  job: () => {
    throw new Error('We have a problem!');
  },
};

const t4 = {
  name: 't4',
  delay: 3500,
  interval: false,
  job: (n) => n * n,
};

manager
  .add(t1, 2, 4)
  .add(t2, 3, 5)
  .add(t3)
  .add(t4, 7);

manager.start();

// manager.remove(t1);

setTimeout(() => {
  console.log('pause t2');
  manager.pause(t2);
}, 2000);

setTimeout(() => {
  console.log('resume t2');
  manager.resume(t2);
}, 3000);

setTimeout(() => {
  console.log('logs: ', manager.print());
}, 5000);
