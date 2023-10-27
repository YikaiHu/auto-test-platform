import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { MainStack } from '../lib/main-stack';

const app = new App();
new MainStack(app, 'AutoTestPlatform', {});