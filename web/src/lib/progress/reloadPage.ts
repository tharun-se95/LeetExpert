/**
 * Its own module because jsdom's location.reload cannot be spied on, so a
 * test that has to see "this tab reloaded" mocks this one instead.
 */
export function reloadPage(): void {
  window.location.reload();
}
