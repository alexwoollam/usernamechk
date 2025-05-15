<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

final class ParentAccount extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'password'
    ];
}
