import Random from 'random-seed'

export const random = Random.create()
export const idSize = 24

// a replacement for random.string(), this function returns characters that are url safe
const urlSafeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'
function randomString(count: number) {
  let s = '';
  for (let i = 0; i < count; i++) {
    s += urlSafeChars[random.range(urlSafeChars.length)]
  }
  return s;
};

export default function getId() {
  return randomString(idSize)
}