import yourFirstGenerator from './01-your-first-generator'
import yieldVsReturn from './02-yield-vs-return'
import forLoopMagic from './03-for-loop-magic'
import earlyExit from './04-early-exit'
import generatorStates from './05-generator-states'
import iteratorProtocol from './06-iterator-protocol'
import memoryEfficiency from './07-memory-efficiency'
import lazyEvaluation from './08-lazy-evaluation'
import generatorExpressions from './09-generator-expressions'
import sendMethod from './10-send-method'
import throwClose from './11-throw-close'
import yieldFrom from './12-yield-from'
import chainingGenerators from './13-chaining-generators'
import fileStreaming from './14-file-streaming'
import itertools from './15-itertools'
import backpressure from './16-backpressure'
import contextManager from './17-context-manager'
import buffering from './18-buffering'
import errorRecovery from './19-error-recovery'
import asyncLlmStreaming from './20-async-llm-streaming'

export const streamingAnimations = [
  yourFirstGenerator,
  yieldVsReturn,
  forLoopMagic,
  earlyExit,
  generatorStates,
  iteratorProtocol,
  memoryEfficiency,
  lazyEvaluation,
  generatorExpressions,
  sendMethod,
  throwClose,
  yieldFrom,
  chainingGenerators,
  fileStreaming,
  itertools,
  backpressure,
  contextManager,
  buffering,
  errorRecovery,
  asyncLlmStreaming,
]

export const streamingSections = [
  {
    title: 'Part 1: The Basics',
    description: 'Build intuition for how generators work',
    animations: [0, 1, 2, 3],
  },
  {
    title: 'Part 2: How It Works',
    description: 'Understand the mechanics under the hood',
    animations: [4, 5, 6, 7],
  },
  {
    title: 'Part 3: Generator Tools',
    description: 'Master the full generator API',
    animations: [8, 9, 10, 11],
  },
  {
    title: 'Part 4: Building Pipelines',
    description: 'Compose generators for data processing',
    animations: [12, 13, 14, 15],
  },
  {
    title: 'Part 5: Expert Patterns',
    description: 'Real-world applications and advanced techniques',
    animations: [16, 17, 18, 19],
  },
]
