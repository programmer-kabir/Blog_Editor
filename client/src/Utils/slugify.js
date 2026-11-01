/**
 * Generates an SEO-friendly URL slug from a title string.
 * Supports English alphanumeric and Unicode characters while stripping punctuation.
 *
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text = "") => {
  if (!text || typeof text !== "string") return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove special punctuation & symbols except unicode words and hyphens
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    // Remove consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
};

/**
 * Builds a canonical/friendly blog URL given an ID and title.
 *
 * @param {string} id
 * @param {string} [title]
 * @returns {string}
 */
export const getBlogSlugUrl = (id, title = "") => {
  if (!id) return "/blogs";
  const slug = slugify(title);
  return slug ? `/blogs/details/${id}/${slug}` : `/blogs/details/${id}`;
};
