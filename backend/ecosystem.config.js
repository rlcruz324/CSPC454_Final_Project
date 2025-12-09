module.exports = {
  apps: [
    {
      name: "lucky-star-real-estate",
      script: "dist/index.js",
      //args: "run dev",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
