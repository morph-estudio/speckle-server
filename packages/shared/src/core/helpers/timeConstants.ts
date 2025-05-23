import { mapValues } from '#lodash'

/*
 * Time with seconds as the base unit
 */
export const TIME = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 28 * 24 * 60 * 60
}

/**
 * Time with milliseconds as the base unit
 */
export const TIME_MS = mapValues(TIME, (value) => value * 1000)
