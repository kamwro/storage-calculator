import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as any;
      const message = typeof res === 'string' ? res : (res?.message ?? 'Error');
      const code = typeof res === 'object' && res?.code ? res.code : this.mapCode(status);
      return response.status(status).json({ message, code });
    }

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal Server Error', code: 'INTERNAL_ERROR' });
  }

  private mapCode(status: number): string {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      default:
        return 'ERROR';
    }
  }
}
