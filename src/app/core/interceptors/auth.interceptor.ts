import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	// 1. Lấy token từ localStorage
	const token = localStorage.getItem('access_token');

	// 2. Nếu có token, clone request và gắn header vào
	if (token) {
		const clonedReq = req.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`
			}
		});
		return next(clonedReq);
	}

	// 3. Nếu không có token, cứ gửi request đi bình thường (cho API login/register)
	return next(req);
};