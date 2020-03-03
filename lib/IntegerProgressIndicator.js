const readline = require('readline')

// Generate an integer progress indicator and draw to console.
// Will redraw after the progress or total is updated.
// 
// Example:
// 400/8000
class IntegerProgressIndicator {
  constructor(total) {
    // the expected number of total items
    this.total = total
    this.progress = 0
  }

  // Increase the progress by the given amount
  addProgress(amount) {
    this.progress += amount
    this.draw()
  }

  // Update the current integer progress, which will
  // automatically update the display
  setProgress(progress) {
    this.progress = progress
    this.draw()
  }

  // Update the total, in case it is not available until later.
  // this will automatically update the display
  setTotal(total) {
    this.total = total
    this.draw()
  }

  draw() {
    // draw current progress
    readline.cursorTo(process.stdout, 0, 0)
    process.stdout.write(`${this.progress}/`)
    // draw total
    if (this.total === undefined) {
      
    } else {
      process.stdout.write(`${this.total}`)
    }
  }
}

module.exports = IntegerProgressIndicator
