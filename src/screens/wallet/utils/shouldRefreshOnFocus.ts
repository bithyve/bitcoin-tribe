const shouldRefreshOnFocus = (autoRefresh: boolean | undefined, isFocused: boolean) =>
  isFocused && (autoRefresh ?? true);

export default shouldRefreshOnFocus;
