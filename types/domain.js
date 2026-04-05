/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} belt_level
 * @property {string} created_at
 */

/**
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} title
 * @property {string} belt
 * @property {string} type
 * @property {number} duration
 */

/**
 * @typedef {Object} ProgressRow
 * @property {string} id
 * @property {string} user_id
 * @property {string} lesson_id
 * @property {boolean} completed
 * @property {number | null} score
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CommunityPost
 * @property {string} id
 * @property {string} user_id
 * @property {string} content
 * @property {string} created_at
 */

export {};
