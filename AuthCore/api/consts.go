package api

import "time"

const internalServerErrorText = "internal error"
const cannotParseBodyErr = "cannot parse body"
const userExistsErr = "user already exists"
const AccessTokenTTL = time.Minute * 30
