import * as net from "net";

declare namespace RemoteProject {
    /**
     * Project constructor options
     */
    export interface ProjectOptions {
        uid: string;
        name: string;
        description: string;
    }

    /**
     * Native (Object) value of Project
     */
    export interface NativeProjectValue {
        name: string;
        description: string;
    }
}

/**
 * RemoteProject
 */
declare class RemoteProject {
    constructor(options: RemoteProject.ProjectOptions);

    // Properties
    public uid: string;
    public name: string;
    public description: string;

    // Methods
    public valueOf(): RemoteProject.NativeProjectValue;
}

export as namespace RemoteClient;
export = RemoteProject;
