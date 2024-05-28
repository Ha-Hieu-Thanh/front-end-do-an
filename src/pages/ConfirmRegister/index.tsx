import { history } from '@/App';
import { verifyRegister } from '@/api/client/auth';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage } from '@/utils/helper/common';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { startTransition } from 'react';
import { useEffect } from 'react';

export default function VerifyRegister() {
  const inviteCode = useLocation().search.replace('?inviteCode=', '');

  const isAuthenticated = !!Cookies.get('token');
  if (isAuthenticated) history.push('/');
  if (!inviteCode) history.push('/login');

  const verifyRegisterMutation = useMutation({
    mutationFn: (payload: { inviteCode: string }) => verifyRegister(payload),
  });

  useEffect(() => {
    verifyRegisterMutation.mutate(
      { inviteCode },
      {
        onSuccess: () => {
          history.push('/login');
          handleSuccessMessage('Verify account successfully!');
        },
        onError: (error) => {
          handleErrorMessage(error);
          history.push('/login');
        },
      },
    );
  }, []);

  return <div></div>;
}
