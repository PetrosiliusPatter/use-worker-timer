// @ts-check

const basePath =
  process.env.NODE_ENV === 'production' ? '/worker-timer-pagetest' : ''

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /*
   * Set the base path as an environment variable, to be used in the app.
   */
  env: {
    BASE_PATH: basePath,
  },

  /**
   * Enable static exports for the App Router.
   *
   * @see https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
   */
  output: 'export',

  /**
   * Set base path. This is usually the slug of your repository.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/basePath
   */
  basePath: basePath,

  /**
   * Disable server-based image optimization. Next.js does not support
   * dynamic features with static exports.
   *
   * @see https://nextjs.org/docs/pages/api-reference/components/image#unoptimized
   */
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
