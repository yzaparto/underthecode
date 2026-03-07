import syncExecution from './01-sync-execution'
import basicCoroutines from './02-basic-coroutines'
import createTask from './03-create-task'
import awaitOrdering from './04-await-ordering'
import blockingLoop from './05-blocking-loop'
import threadsProcesses from './06-threads-processes'
import schedulingPatterns from './07-scheduling-patterns'
import cancellation from './08-cancellation'
import timeouts from './09-timeouts'
import asCompleted from './10-as-completed'
import queues from './11-queues'
import semaphore from './12-semaphore'
import streaming from './13-streaming'
import exceptionGroup from './14-exception-group'
import event from './15-event'
import lock from './16-lock'
import gracefulShutdown from './17-graceful-shutdown'
import retry from './18-retry'
import barrier from './19-barrier'
import waitFirst from './20-wait-first'

export const animations = [
  syncExecution,
  basicCoroutines,
  createTask,
  awaitOrdering,
  blockingLoop,
  threadsProcesses,
  schedulingPatterns,
  cancellation,
  timeouts,
  asCompleted,
  queues,
  semaphore,
  streaming,
  exceptionGroup,
  event,
  lock,
  gracefulShutdown,
  retry,
  barrier,
  waitFirst,
]
