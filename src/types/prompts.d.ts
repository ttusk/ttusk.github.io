declare module "prompts" {
    export type PromptValue = string | boolean | undefined;
    export type PromptType = "text" | "confirm" | "select";

    export interface PromptChoice {
        title: string;
        value: string;
    }

    export interface PromptRenderContext {
        value: PromptValue;
        msg: string;
        done: boolean;
        rendered?: string;
    }

    export interface PromptObject {
        type: PromptType;
        name: string;
        message: string;
        hint?: string;
        initial?: PromptValue;
        choices?: readonly PromptChoice[];
        validate?: (value: string) => true | string;
        onRender?: (this: PromptRenderContext) => void;
    }

    export interface PromptAnswers {
        [name: string]: PromptValue;
    }

    export interface PromptOptions {
        onSubmit?: (
            question: PromptObject,
            answer: PromptValue,
            answers: PromptAnswers,
        ) => void | boolean;
        onCancel?: (
            question: PromptObject,
            answers: PromptAnswers,
        ) => void | boolean;
    }

    export interface Prompts {
        (
            questions: PromptObject | readonly PromptObject[],
            options?: PromptOptions,
        ): Promise<PromptAnswers>;
    }

    const prompts: Prompts;
    export default prompts;
}
