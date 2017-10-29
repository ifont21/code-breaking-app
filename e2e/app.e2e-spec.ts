import { CodeBreakingAppPage } from './app.po';

describe('code-breaking-app App', () => {
  let page: CodeBreakingAppPage;

  beforeEach(() => {
    page = new CodeBreakingAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
