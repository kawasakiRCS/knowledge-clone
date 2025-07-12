/**
 * サインアップページ
 * 
 * @description ユーザー新規登録フォーム
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { MainLayout } from '@/components/layout/MainLayout';

interface FormData {
  userKey: string;
  userName: string;
  password: string;
  confirm_password: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const SignupPage: React.FC = () => {
  const router = useRouter();
  const { t } = useLocale();
  const [formData, setFormData] = useState<FormData>({
    userKey: '',
    userName: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== name));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    // Required field validation
    if (!formData.userKey.trim()) {
      newErrors.push({ field: 'userKey', message: t('errors.required') });
    }
    if (!formData.userName.trim()) {
      newErrors.push({ field: 'userName', message: t('errors.required') });
    }
    if (!formData.password.trim()) {
      newErrors.push({ field: 'password', message: t('errors.required') });
    }
    if (!formData.confirm_password.trim()) {
      newErrors.push({ field: 'confirm_password', message: t('errors.required') });
    }

    // Email format validation
    if (formData.userKey && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userKey)) {
      newErrors.push({ field: 'userKey', message: t('errors.invalid.email') });
    }

    // Password match validation
    if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password) {
      newErrors.push({ field: 'confirm_password', message: t('knowledge.user.invalid.same.password') });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWarnings([]);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/signup/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Handle different registration types
        switch (data.registrationType) {
          case 'USER':
            // Free registration - redirect to home
            router.push('/');
            break;
          case 'MAIL':
            // Email confirmation required
            router.push('/open/signup/mail_sended');
            break;
          case 'APPROVE':
            // Admin approval required
            router.push('/open/signup/provisional_registration');
            break;
          default:
            router.push('/');
        }
      } else {
        // Handle errors
        if (data.errors) {
          const newErrors: ValidationError[] = data.errors.map((err: any) => ({
            field: err.field || 'general',
            message: t(err.message)
          }));
          setErrors(newErrors);
        }
        if (data.warnings) {
          setWarnings(data.warnings.map((warn: any) => t(warn.message)));
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors([{ field: 'general', message: 'An error occurred. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(err => err.field === field)?.message;
  };

  return (
    <MainLayout>
      <h4 className="title">{t('knowledge.signup.title')}</h4>

      <div className="row">
        <div className="col-sm-12 col-md-12">
          {/* Display warnings */}
          {warnings.length > 0 && (
            <div className="alert alert-warning" role="alert">
              {warnings.map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          )}

          {/* Display general errors */}
          {errors.some(err => err.field === 'general') && (
            <div className="alert alert-danger" role="alert">
              {errors
                .filter(err => err.field === 'general')
                .map((err, index) => (
                  <div key={index}>{err.message}</div>
                ))}
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" action="/api/signup/save" role="form">
            <div className="form-group">
              <label htmlFor="userKey">{t('knowledge.signup.label.mail')}</label>
              <input
                type="text"
                className={`form-control ${getFieldError('userKey') ? 'is-invalid' : ''}`}
                name="userKey"
                id="userKey"
                placeholder="Mail Address"
                value={formData.userKey}
                onChange={handleInputChange}
              />
              {getFieldError('userKey') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('userKey')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="userName">{t('knowledge.signup.label.name')}</label>
              <input
                type="text"
                className={`form-control ${getFieldError('userName') ? 'is-invalid' : ''}`}
                name="userName"
                id="userName"
                placeholder="User Name"
                value={formData.userName}
                onChange={handleInputChange}
              />
              {getFieldError('userName') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('userName')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('knowledge.signup.label.password')}</label>
              <input
                type="password"
                className={`form-control ${getFieldError('password') ? 'is-invalid' : ''}`}
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {getFieldError('password') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('password')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">{t('knowledge.signup.label.confirm.password')}</label>
              <input
                type="password"
                className={`form-control ${getFieldError('confirm_password') ? 'is-invalid' : ''}`}
                name="confirm_password"
                id="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleInputChange}
              />
              {getFieldError('confirm_password') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('confirm_password')}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <i className="fa fa-save"></i>&nbsp;{t('label.registration')}
            </button>
            <Link
              href="/open/knowledge/list"
              className="btn btn-success"
              role="button"
            >
              <i className="fa fa-list-ul"></i>&nbsp;{t('knowledge.view.back.list')}
            </Link>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignupPage;