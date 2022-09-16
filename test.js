function CustomPromise(callback) {
  this.isResolved = false;
  this.promise = new Promise((resolve) =>
    callback((response) => {
      this.isResolved = true;
      resolve(response);
    })
  );
}

class Parallel {
  constructor(options, promise) {
    this.parallelJobs = options.parallelJobs;
    this.promise = promise || [];
  }
  job(callback) {
    const promise = [...this.promise];
    const numberUnfinished = () =>
      promise.filter((el) => !el.isResolved).length;
    if (numberUnfinished() < this.parallelJobs) {
      this.promise.push(new CustomPromise(callback));
    } else {
      this.promise.push(
        new CustomPromise((res) => {
          (async () => {
            while (numberUnfinished() >= this.parallelJobs) {
              await Promise.race(
                promise.filter((el) => !el.isResolved).map((el) => el.promise)
              );
            }
            callback(res);
          })();
        })
      );
    }
    return this;
  }
  done(callback) {
    Promise.all(this.promise.map((el) => el.promise)).then(callback);
    return this;
  }
}

// Don`t change the code bellow this line

var runner = new Parallel({
  parallelJobs: 2,
});

runner.job(step1).job(step2).job(step3).job(step4).done(onDone);

function step1(done) {
  console.log("step1");
  setTimeout(done, 1000, "Step 1");
}

function step2(done) {
  console.log("step2");
  setTimeout(done, 1200, "Step 2");
}

function step3(done) {
  console.log("step3");
  setTimeout(done, 1500, "Step 3");
}

function step4(done) {
  console.log("step4");
  setTimeout(done, 100, "Step 4");
}

var isPassed = false;

function onDone(results) {
  console.log("onDone", results);
  console.assert(Array.isArray(results), "Should be array");
  console.log("Thanks, all works fine");
  isPassed = true;
}

setTimeout(function () {
  if (isPassed) return;
  console.error("Test is not done.");
}, 3500);
