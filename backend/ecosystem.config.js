module.exports = {
  apps: [
    {
      name: "lucky-star-real-estate",
      script: "npm run dev",
      //interpreter: "ts-node",
      args: "run dev",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
