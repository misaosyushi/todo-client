export interface ToDo {
  id: string
  title: string
  detail: string
  deadlineDate: string
  status: string
}

export const Status = {
  ToDo: 'todo',
  InProgress: 'inProgress',
  Done: 'done',
} as const
