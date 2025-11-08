


export const debugAuth = {
  log: (message: string, data?: unknown) => {
    console.log(` AUTH DEBUG: ${message}`, data || '');
  },
  
  checkStorage: () => {
    if (typeof window === 'undefined') return;
    
    const tokens = {
      localStorage: {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        user_data: localStorage.getItem('user_data')
      },
      sessionStorage: {
        access_token: sessionStorage.getItem('access_token'),
        refresh_token: sessionStorage.getItem('refresh_token'),
        user_data: sessionStorage.getItem('user_data')
      }
    };
    
    console.log(' STORAGE CHECK:', tokens);
    return tokens;
  },
  
  checkURL: () => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    
    console.log(' URL PARAMS:', { token, role });
    return { token, role };
  }
};