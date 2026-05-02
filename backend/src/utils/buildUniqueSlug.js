const slugify = require('slugify');

async function buildUniqueSlug(Model, value, excludeId) {
  const baseSlug = slugify(value, { lower: true, strict: true, trim: true });
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Model.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existing) return candidate;

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

module.exports = buildUniqueSlug;