export default {
  scanner: {
    device: 'mobile',
    include: ['/', '/category/*', '/product/*'],
  },
  lighthouseOptions: {
    onlyCategories: ['performance'],
  },
  // # docker config
  // puppeteerOptions: {
  //  args: ['--no-sandbox'],
  //},
  //server: {
  //  open: true,
  //},
};
