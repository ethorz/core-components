import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import cn from 'classnames';
import { Button } from '@alfalab/core-components-button';
import { Link } from '@alfalab/core-components-link';

import { SignConfirmation } from './components';

import styles from './index.module.css';

export type ContentAlign = 'left' | 'center';

export type ConfirmationProps = {
    /**
     * Значение поля ввода
     */
    value: string;

    /**
     * Флаг состояния обработки введенного кода.
     */
    codeChecking?: boolean;

    /**
     * Флаг состояния отправки кода.
     */
    codeSending?: boolean;

    /**
     * Текст ошибки подписания
     */
    error?: string;

    /**
     * Дополнительный контент
     */
    additionalContent?: React.ReactNode;

    /**
     * Флаг критичности ошибки подписания.
     * Если true - ошибка подписания рисуется на экране без поля ввода, но с кнопкой "Запросить код"
     * Если false - ошибка подписания рисуется под полем ввода кода
     */
    errorIsFatal?: boolean;

    /**
     * Дополнительный класс
     */
    className?: string;

    /**
     * Номер телефона, на который отправляется смс.
     * Пробрасывается в компонент обратного отсчета as is и форматируется там же.
     * Должен быть в формате '+7 000 000 00 00'
     */
    phone?: string;

    /**
     * Управление необходимостью маскировать номер телефона
     */
    hasPhoneMask?: boolean;

    /**
     * Количество символов, которое можно ввести в поле ввода подписания до того, как произойдет автоотправка
     */
    requiredCharAmount?: number;

    /**
     * Управление отображением таймера с кнопкой "Запросить код"
     */
    hasSmsCountdown?: boolean;

    /**
     * Длительность обратного отсчета на кнопке повторного запроса смс, в милисекундах
     */
    countdownDuration?: number;

    /**
     * Заголовок экрана подписания
     */
    signTitle?: string;

    /**
     * Заголовок экрана блокирующей ошибки
     */
    errorTitle?: string;

    /**
     * Идентификатор для систем автоматизированного тестирования
     */
    dataTestId?: string;

    /**
     * Текст лоадера при проверке кода
     */
    codeCheckingText?: string;

    /**
     * Текст лоадера при отправке кода
     */
    codeSendingText?: string;

    /**
     * Текст кнопки при блокирующей ошибке
     */
    buttonErrorText?: string;

    /**
     * Текст кнопки "Запросить код"
     */
    buttonRetryText?: string;

    /**
     * Позиционирование контента
     */
    alignContent?: ContentAlign;

    /**
     * Обработчик события завершения ввода кода подписания
     */
    onInputFinished: (value?: string) => void;

    /**
     * Обработчик события изменения значения поля ввода кода подписания
     */
    onInputChange: (value?: string) => void;

    /**
     * Обработчик события нажатия на кнопку "Запросить код"
     */
    onSmsRetryClick: () => void;

    /**
     * Обработчик события завершения обратного отсчета для повторного запроса смс
     */
    onCountdownFinished?: () => void;

    /**
     * Обработчик события нажатия на ссылку "не приходит смс?"
     */
    onSmsHintLinkClick?: () => void;

    /**
     * Обработчик события нажатия на ссылку "Попробовать заново", которая появляется при критической ошибке
     */
    onActionWithFatalError?: () => void;
};

export const Confirmation = forwardRef<HTMLDivElement, ConfirmationProps>(
    (
        {
            additionalContent,
            className,
            countdownDuration = 60000,
            dataTestId,
            errorIsFatal,
            errorTitle = 'Превышено количество попыток ввода кода',
            error = 'Выполните операцию с\xa0самого начала',
            hasPhoneMask = true,
            hasSmsCountdown = true,
            phone,
            requiredCharAmount = 5,
            signTitle = 'Введите код из\xa0смс',
            value,
            codeSending = false,
            codeChecking = false,
            codeCheckingText = 'Проверка кода',
            codeSendingText = 'Отправляем код',
            buttonErrorText = 'Понятно',
            buttonRetryText = 'Запросить код повторно',
            alignContent = 'left',
            onInputFinished,
            onSmsRetryClick,
            onActionWithFatalError,
            onCountdownFinished,
            onInputChange,
            onSmsHintLinkClick,
        },
        ref,
    ) => {
        const [showHint, setShowHint] = useState(false);

        const [retries, setRetries] = useState(0);

        const [countdownFinished, setCountdownFinished] = useState(false);

        const shouldShowErrorComponent = errorIsFatal && !!error;

        const shouldShowSignComponent = !showHint && !shouldShowErrorComponent;

        const shouldShowHintComponent = showHint && !shouldShowErrorComponent;

        const nonFatalError = errorIsFatal ? '' : error;

        const shouldShowHintLink = countdownFinished && !codeChecking && retries > 0;

        const inputRef = useRef<HTMLInputElement>(null);

        const handleSmsRetryClick = useCallback(() => {
            setRetries(prevRetry => prevRetry + 1);
            setCountdownFinished(false);
            onSmsRetryClick();
        }, [onSmsRetryClick]);

        const handleSmsRetryFromHintClick = useCallback(() => {
            setRetries(prevRetry => prevRetry + 1);
            setCountdownFinished(false);
            setShowHint(false);
            onSmsRetryClick();
        }, [onSmsRetryClick]);

        const handleCountdownFinished = useCallback(() => {
            setCountdownFinished(true);

            if (onCountdownFinished) {
                onCountdownFinished();
            }
        }, [onCountdownFinished]);

        const handleSmsHintLinkClick = useCallback(() => {
            setShowHint(true);

            if (onSmsHintLinkClick) {
                onSmsHintLinkClick();
            }
        }, [onSmsHintLinkClick]);

        const handleErrorSmsRetryClick = useCallback(() => {
            if (onActionWithFatalError) {
                onActionWithFatalError();
            } else {
                onSmsRetryClick();
            }
        }, [onActionWithFatalError, onSmsRetryClick]);

        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, []);

        return (
            <div
                className={cn(styles.component, styles[alignContent], className)}
                ref={ref}
                data-test-id={dataTestId}
            >
                {shouldShowSignComponent && (
                    <SignConfirmation
                        codeChecking={codeChecking}
                        codeSending={codeSending}
                        smsHintVisible={shouldShowHintLink}
                        additionalContent={additionalContent}
                        requiredCharAmount={requiredCharAmount}
                        hasSmsCountdown={hasSmsCountdown}
                        countdownDuration={countdownDuration}
                        phone={phone}
                        value={value}
                        hasPhoneMask={hasPhoneMask}
                        error={nonFatalError}
                        title={signTitle}
                        inputRef={inputRef}
                        codeCheckingText={codeCheckingText}
                        codeSendingText={codeSendingText}
                        alignContent={alignContent}
                        onInputFinished={onInputFinished}
                        onInputChange={onInputChange}
                        onSmsRetryClick={handleSmsRetryClick}
                        onCountdownFinished={handleCountdownFinished}
                        onSmsHintLinkClick={handleSmsHintLinkClick}
                    />
                )}

                {shouldShowErrorComponent && (
                    <div className={styles.error}>
                        <span className={styles.errorHeader}>{errorTitle}</span>

                        <span className={styles.errorText}>{error}</span>

                        <Button
                            size='s'
                            view='secondary'
                            onClick={handleErrorSmsRetryClick}
                            block={true}
                        >
                            {buttonErrorText}
                        </Button>
                    </div>
                )}

                {shouldShowHintComponent && (
                    <div className={styles.phoneHintWrap}>
                        <span className={styles.errorHeader}>Не приходит сообщение?</span>

                        <span className={styles.phoneHintText}>
                            Если у вас сменился номер телефона, пожалуйста, обратитесь в любое
                            отделение банка.
                        </span>

                        <div className={styles.phonesWrap}>
                            <div className={styles.phoneWrap}>
                                <Link className={styles.phoneLink} href='tel:+78002000000'>
                                    8 800 200 00 00{' '}
                                </Link>

                                <span className={styles.phoneDescription}>
                                    — для звонков по России
                                </span>
                            </div>

                            <div className={styles.phoneWrap}>
                                <Link className={styles.phoneLink} href='tel:+74957888878'>
                                    +7 495 788 88 78{' '}
                                </Link>

                                <span className={styles.phoneDescription}>
                                    — в Москве и за границей
                                </span>
                            </div>
                        </div>

                        <Button
                            className={styles.repeatButton}
                            size='s'
                            view='secondary'
                            block={true}
                            onClick={handleSmsRetryFromHintClick}
                        >
                            {buttonRetryText}
                        </Button>
                    </div>
                )}
            </div>
        );
    },
);

Confirmation.defaultProps = {
    countdownDuration: 60000,
    errorTitle: 'Превышено количество попыток ввода кода',
    error: 'Выполните операцию с\xa0самого начала',
    hasPhoneMask: true,
    hasSmsCountdown: true,
    requiredCharAmount: 5,
    signTitle: 'Введите код из\xa0смс',
    codeSending: false,
    codeChecking: false,
    codeCheckingText: 'Проверка кода',
    codeSendingText: 'Отправляем код',
    buttonErrorText: 'Понятно',
    buttonRetryText: 'Запросить код повторно',
    alignContent: 'left',
};
