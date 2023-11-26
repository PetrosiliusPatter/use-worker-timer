<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Stargazers][stars-shield]][stars-url]\
[![Issues][issues-shield]][issues-url]\
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/PetrosiliusPatter/use-worker-timer">
    <img src="assets/icon.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">use-worker-timer</h3>

<p align="center">
    Accurate timers for React!
    <br />
    <a href="https://petrosiliuspatter.github.io/use-worker-timer/"><strong>View Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/PetrosiliusPatter/use-worker-timer/issues">Report Bug</a>
    ·
    <a href="https://github.com/PetrosiliusPatter/use-worker-timer/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Scheduling events in the browser can be challenging. Timeouts you set may be delayed by
other tasks running on the main thread. Switching tabs or resizing the window can further
impact accuracy, as the main thread gets throttled by the browser. This becomes especially
noticeable when events are scheduled to fire in sequence, as the delay will accumulate.

In contrast, web workers run on a separate thread in the background, independent of
intensive computations on the main thread, and are not throttled by the browser. However,
they are notoriously challenging to use since the only way to communicate with them is
through messages sent between the threads.

This package aims to address this issue by providing a convenient React hook for
scheduling events in a web worker, while abstracting away some of the complexities of
working with them directly.

To use the hook, you define a list of checkpoints and a callback that is called whenever a
checkpoint is reached. It returns a set of functions to control the playback of these
checkpoints, including playing, pausing, navigating to a specific point in the playback,
and looping. Additionally, it provides the current state of the playback and an estimated
progress based on the elapsed time since the last reported checkpoint.

#### Built With

[![Deno][Deno]][Deno-url] [![React][React.js]][React-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- React
- npm or deno

### Installation

#### Deno

```ts
import { usePlayback } from "https://deno.land/x/use_worker_timer/index.ts"
```

#### NPM

```
npm install use-worker-timer
```

```ts
import { usePlayback } from "use-worker-timer"
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

To use this hook, you pass in a list of checkpoints, as ms values, and a callback that is
called whenever a checkpoint is reached. The hook will return a bunch of functions to
control the playback, as well as the current state of the playback.

```ts
// Creates a list of 64 events, with a spacing of 60 bpm
const BPM = 60
const checkpoints = Array.from({ length: 4 * 16 }).map((_, i) => (i * (60 * 1000)) / BPM)

const callbackForTime = (ms: number) => {
  console.log(`Reached checkpoint ${reportedTime}`)
  if(i === events.length - 1){
    console.log("Reached the end!")
  }
}

... 

const {
  isReady, // Wether the worker is ready to start playing
  playState, // The state of the playback as reported by the worker
  estimatedProgress, // The estimated progress, based on the last reported checkpoint
  lagLog, // A log of the inaccuracy of the timer
  play,
  pause,
  stop,
  setLooping,
  setPlaybackProgress,
} = usePlayback({
  reportCheckpoint: callbackForTime,
  checkpoints: checkpoints,
  estimationUpdateInterval: 100, // How often to update the estimated progress
})
```

##### Arguments

- `reportCheckpoint` is called whenever a checkpoint is reached.
- `checkpoints` is a list of ms values, at which the worker will fire the
  `reportCheckpoint` callback.
- `estimationUpdateInterval` is how often the estimated progress will be updated. Defaults
  to never (always same as `playState.progress`). If omitted, the estimated progress will
  be the same as in playState.

##### Return values

- `isReady` is a boolean that is true when the worker is ready to start playing.
- `playState` will update whenever a checkpoint is reached or a playback function is
  called. It is an object with the following properties:
  - `playing` is a boolean that is true when the worker is playing.
  - `progress` is the progress of the playback, in ms.
  - `looping` is a boolean that is true when the worker is looping.
- `estimatedProgress` will update every `estimationUpdateInterval` milliseconds, and is
  based on the last reported checkpoint. As this is calculated on the main thread, it
  might be slightly off. I recommend using it for UI, but use the reported checkpoints for
  logic.
- `lagLog` is an array of numbers, that represent the inaccuracy of the timer. It will be
  filled with the inaccuracy per checkpoint, in ms, whenever a checkpoint is reached.
- `play`, `pause`, `stop`, `setLooping` and `setPlaybackProgress` are functions that
  control the playback. Self explanatory.

Take a look at the full [example](www.todo.com) ([source](example/src/app/page.tsx)).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

PetrosiliusPatter - PetrosiliusPatter@proton.me

Project Link:
[https://github.com/PetrosiliusPatter/use-worker-timer](https://github.com/PetrosiliusPatter/use-worker-timer)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[stars-shield]: https://img.shields.io/github/stars/PetrosiliusPatter/use-worker-timer.svg?style=for-the-badge
[stars-url]: https://github.com/PetrosiliusPatter/use-worker-timer/stargazers
[issues-shield]: https://img.shields.io/github/issues/PetrosiliusPatter/use-worker-timer.svg?style=for-the-badge
[issues-url]: https://github.com/PetrosiliusPatter/use-worker-timer/issues
[license-shield]: https://img.shields.io/github/license/PetrosiliusPatter/use-worker-timer.svg?style=for-the-badge
[license-url]: https://github.com/PetrosiliusPatter/use-worker-timer/blob/main/LICENSE.txt
[React.js]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[React-url]: https://reactjs.org/
[Deno]: https://img.shields.io/badge/deno%20js-000000?style=for-the-badge&logo=deno&logoColor=white
[Deno-url]: https://deno.com/
