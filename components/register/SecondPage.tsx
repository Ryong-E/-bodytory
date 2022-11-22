import Input from "@components/Input";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RegisterForm } from "pages/auth/register";
import useApi from "utils/client/customApi";

interface SecondRegisterForm {
  accountId: string;
  password: string;
  passwordConfirm: string;
}
interface RegisterPageProps {
  user: RegisterForm | undefined;
  setUser: Dispatch<SetStateAction<RegisterForm | undefined>>;
  setPage: Dispatch<SetStateAction<number>>;
}
const SecondPage = ({ user, setUser, setPage }: RegisterPageProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setError,
    setValue,
    clearErrors,
  } = useForm<SecondRegisterForm>({
    mode: "onChange",
    defaultValues: {
      accountId: user?.accountId,
      password: user?.password,
      passwordConfirm: user?.passwordConfirm,
    },
  });
  const [currentInput, setCurrentInput] = useState(1);
  const [currentComment, setCurrentComment] = useState("사용하실 아이디를 입력해주세요");
  const { postApi: checkAccountIdApi } = useApi("/api/auth/register/check/id");

  const AccountIdRegex = /^[a-zA-Z0-9]*$/;

  const onValid = (data: SecondRegisterForm) => {
    if (user?.isNotDuplicate) {
      if (watch("password") !== watch("passwordConfirm")) {
        return setError("passwordConfirm", { type: "custom", message: "비밀번호가 일치하지 않아요" });
      }
      setUser(prev => ({ ...prev!, ...data }));
      setPage(3);
    } else {
      setError("accountId", { message: "아이디 중복확인 해주세요!" });
    }
  };

  const handleClickCheckAccountId = async () => {
    try {
      if (!watch("accountId")) return setError("accountId", { message: "아이디를 입력해주세요" });
      await checkAccountIdApi({ accountId: watch("accountId") });
      setUser(prev => ({ ...prev!, isNotDuplicate: true }));
      clearErrors("accountId");
      setCurrentInput(2);
      setCurrentComment("사용하실 비밀번호를 입력해주세요")
    } catch (err: any) {
      setError("accountId", { type: "custom", message: `이미 사용 중인 아이디에요!\n다른아이디를 입력해주세요` });
    }
  };
  const isErrorsMessage = errors.accountId?.message || errors.password?.message || errors.passwordConfirm?.message
  return (
    <form onSubmit={handleSubmit(onValid)}>
      <div className="errorMessageBox">
        <p>{isErrorsMessage ? isErrorsMessage  : currentComment}</p>
      </div>
      <Input
        label="아이디"
        name="accountId"
        placeholder="아이디를 입력해주세요"
        register={register("accountId", {
          required: "사용하실 아이디를 입력해주세요",
          validate: value => AccountIdRegex.test(value) || "아이디는 영문 대소문자, 숫자를 입력해주세요",
          onChange() {
            setUser(prev => ({ ...prev!, isNotDuplicate: false }));
            setCurrentInput(1);
            setValue("password", "");
            setValue("passwordConfirm", "");
          },
        })}
      />
      <button type="button" onClick={handleClickCheckAccountId} disabled={user?.isNotDuplicate}>
        중복확인
      </button>

      {currentInput >= 2 && (
        <Input
          type="password"
          label="비밀번호"
          name="password"
          placeholder="비밀번호를 입력해주세요"
          register={register("password", {
            required: "비밀번호는 6자리 이상 영문 대소문자, 숫자를 포함해서 입력해주세요",
            // pattern: {
            //   value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i,
            //   message: "비밀번호가 안전하지 않아요.",
            // },
            onChange() {
              if (!watch("password")) {
                setCurrentInput(2);
                setValue("passwordConfirm", "");
                setCurrentComment("사용하실 아이디를 입력해주세요")
              } else {
                setCurrentInput(3);
                setCurrentComment("비밀번호를 한번 더 입력해주세요")
              }
            },
          })}
        />
      )}
      {currentInput === 3 && (
        <Input
          type="password"
          label="비밀번호 확인"
          name="passwordConfirm"
          placeholder="한번 더 입력해주세요"
          register={register("passwordConfirm", {
            required: "비밀번호가 일치하지 않아요! 비밀번호를 다시 확인해주세요",
          })}
        />
      )}
      <button type="button" onClick={() => setPage(1)}>
        이전 페이지
      </button>
      <button type="submit" disabled={currentInput !== 3}>
        다음 페이지
      </button>
    </form>
  );
};

export default SecondPage;
